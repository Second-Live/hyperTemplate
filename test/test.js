import { expect } from "chai";

describe("hyper", function () {
  afterEach(function () {
    document.body.innerHTML = "";
  });

  it("## injecting text and attributes", function () {
    let i = 0;
    const div = document.body.appendChild(document.createElement("div"));
    const render = hyperHTML.bind(div);
    function update(i) {
      return render`<p data-counter="${i}">Time: ${
        Math.random() * new Date()
      }</p>`;
    }
    function compare(html) {
      return /^\s*<p data-counter="\d">\s*Time: \d+\.\d+<[^>]+?>\s*<\/p>\s*$/i.test(
        html
      );
    }
    const html = update(i++).innerHTML;
    const p = div.querySelector("p");
    const attr = p.attributes[0];
    expect(compare(html), "correct HTML").to.be.true;
    expect(html, "correctly returned").to.equal(div.innerHTML);
    return new Promise(function (resove) {
      setTimeout(function () {
        //tressa.log("## updating same nodes");
        const html = update(i++).innerHTML;
        expect(compare(html), "correct HTML update").to.be.true;
        expect(html, "update applied").to.equal(div.innerHTML);
        expect(p, "no node was changed").to.equal(div.querySelector("p"));
        expect(attr, "no attribute was changed").to.equal(p.attributes[0]);
        resove();
      });
    });
  });

  it("## perf: same virtual text twice", function () {
    const div = document.body.appendChild(document.createElement("div"));
    const render = hyperHTML.bind(div);
    const html = (update("hello").innerHTML, update("hello").innerHTML);
    function update(text) {
      return render`<p>${text} world</p>`;
    }
    expect(update("hello").innerHTML, "same text").to.equal(
      update("hello").innerHTML
    );
  });

  it("## injecting HTML", function () {
    const div = document.body.appendChild(document.createElement("div"));
    const render = hyperHTML.bind(div);
    const html = update("hello").innerHTML;
    function update(text) {
      return render`<p>${["<strong>" + text + "</strong>"]}</p>`;
    }
    function compare(html) {
      return /^<p><strong>\w+<\/strong><!--.+?--><\/p>$/i.test(html);
    }
    expect(compare(html), "HTML injected").to.be.true;
    expect(html, "HTML returned").to.equal(div.innerHTML);
  });

  it("## function attributes", function () {
    const div = document.body.appendChild(document.createElement("div"));
    const render = hyperHTML.bind(div);
    let times = 0;
    update(function (e) {
      expect(e.type).to.equal("click");
      if (++times > 1) {
        return expect(false, "events are broken").to.be.true;
      }
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      expect(true, "onclick invoked").to.be.true;
      expect(a.hasAttribute("onclick"), "no attribute").to.be.false;
      update(null);
      e = new CustomEvent("click");
      a.dispatchEvent(e);
    });
    function update(click) {
      // also test case-insensitive builtin events
      return render`<a href="#" onClick="${click}">click</a>`;
    }
    const a = div.querySelector("a");
    const e = new CustomEvent("click");
    a.dispatchEvent(e);
  });

  it("## changing template", function () {
    const div = document.body.appendChild(document.createElement("div"));
    const render = hyperHTML.bind(div);
    const html = update("hello").innerHTML;
    function update(text) {
      return render`<p>${{ any: ["<em>" + text + "</em>"] }}</p>`;
    }
    function compare(html) {
      return /^<p><em>\w+<\/em><!--.+?--><\/p>$/i.test(html);
    }
    expect(compare(html), "new HTML injected").to.be.true;
    expect(html, "new HTML returned").to.equal(div.innerHTML);
  });

  it("## custom events", function () {
    const render = hyperHTML.bind(document.createElement("p"));
    const e = new CustomEvent("Custom-EVENT", {
      bubbles: true,
      cancelable: true
    });
    render`<span onCustom-EVENT="${function (e) {
      expect(e.type).to.equal("Custom-EVENT");
    }}">how cool</span>`.firstElementChild.dispatchEvent(e);
  });

  it("## multi wire removal", function () {
    const render = hyperHTML.wire();
    let update = function () {
      return render`
      <p>1</p>
      <p>2</p>
    `;
    };
    update().remove();
    update = function () {
      return render`
      <p>1</p>
      <p>2</p>
      <p>3</p>
    `;
    };
    update().remove();
    expect(true, "OK").to.be.true;
  });

  it("## the attribute id", function () {
    const div = document.createElement("div");
    hyperHTML.bind(div)`<p id=${"id"} class='class'>OK</p>`;
    const p = div.firstChild;
    expect(p.id, "the id is preserved").to.equal("id");
    expect(p.className, "the class is preserved").to.equal("class");
  });

  it("## hyperHTML.wire()", function () {
    let render = hyperHTML.wire();
    let update = function () {
      return render`
        <p>1</p>
      `;
    };
    let node = update();
    expect(node.nodeName.toLowerCase(), "correct node").to.equal("p");
    let same = update();
    expect(node, "same node returned").to.equal(same);

    render = hyperHTML.wire(null);
    update = function () {
      return render`
        0
        <p>1</p>
      `;
    };
    node = update().childNodes;
    expect(Array.isArray(node), "list of nodes").to.be.true;
    same = update().childNodes;
    expect(node, "same list returned").deep.equal(same);

    const div = document.createElement("div");
    render = hyperHTML.bind(div);
    render`${node}`;
    same = div.childNodes;
    expect(node[0] && node.every((n, i) => same[i] === n), "same list applied")
      .to.be.true;

    function returnSame() {
      return render`a`;
    }
    render = hyperHTML.wire();
    expect(returnSame(), "template sensible wire").to.equal(returnSame());
  });

  it("## hyperHTML.wire(object)", function () {
    const point = { x: 1, y: 2 };
    function update() {
      return hyperHTML.wire(point)`
      <span style="${`
        position: absolute;
        left: ${point.x}px;
        top: ${point.y}px;
      `}">O</span>`;
    }
    expect(update(), "same output").to.equal(update());
    expect(hyperHTML.wire(point), "same wire").to.equal(hyperHTML.wire(point));
  });

  it("## preserve first child where first child is the same as incoming", function () {
    const div = document.body.appendChild(document.createElement("div"));
    const render = hyperHTML.bind(div);
    const observer = new window.MutationObserver(function (mutations) {
      for (let i = 0, len = mutations.length; i < len; i++) {
        trackMutations(mutations[i].addedNodes, "added");
        trackMutations(mutations[i].removedNodes, "removed");
      }
    });

    observer.observe(div, {
      childList: true,
      subtree: true
    });

    const counters = [];

    function trackMutations(nodes, countKey) {
      for (let i = 0, len = nodes.length, counter, key; i < len; i++) {
        if (nodes[i]?.getAttribute?.("data-test")) {
          key = nodes[i].getAttribute("data-test");
          counter = counters[key] || (counters[key] = { added: 0, removed: 0 });
          counter[countKey]++;
        }
        if (nodes[i].childNodes.length > 0) {
          trackMutations(nodes[i].childNodes, countKey);
        }
      }
    }

    const listItems = [];

    function update(items) {
      render`
      <section>
        <ul>${items.map(function (item, i) {
          return hyperHTML.wire(listItems[i] || (listItems[i] = {}))`
            <li data-test="${i}">${() => item.text}</li>
            `;
        })}</ul>
      </section>`;
    }

    update([]);

    setTimeout(function () {
      update([{ text: "test1" }]);
    }, 10);
    setTimeout(function () {
      update([{ text: "test1" }, { text: "test2" }]);
    }, 20);
    setTimeout(function () {
      update([{ text: "test1" }]);
    }, 30);
    return new Promise(function (resolve) {
      setTimeout(function () {
        expect(counters[0].added).to.equal(1);
        expect(counters[0].removed).to.equal(0);
        resolve();
      }, 100);
    });
  });

  it("## rendering one node", function () {
    const div = document.createElement("div");
    const br = document.createElement("br");
    const hr = document.createElement("hr");
    hyperHTML.bind(div)`<div>${br}</div>`;
    let child = div.firstChild;
    expect(child.firstChild, "one child is added").to.equal(br);

    hyperHTML.bind(div)`<div>${hr}</div>`;
    child = div.firstChild;
    expect(child.firstChild, "one child is changed").to.equal(hr);

    hyperHTML.bind(div)`<div>${[hr, br]}</div>`;
    child = div.firstChild;
    expect(child.childNodes[0], "more children are added").to.equal(hr);
    expect(child.childNodes[1], "more children are added").to.equal(br);

    hyperHTML.bind(div)`<div>${[br, hr]}</div>`;
    child = div.firstChild;
    expect(child.childNodes[0], "children can be swapped").to.equal(br);
    expect(child.childNodes[1], "children can be swapped").to.equal(hr);

    hyperHTML.bind(div)`<div>${br}</div>`;
    child = div.firstChild;
    expect(child.firstChild, "one child is kept").to.equal(br);

    hyperHTML.bind(div)`<div>${[]}</div>`;
    expect(/<div><!--.+?--><\/div>/.test(div.innerHTML), "dropped all children")
      .to.be.true;
  });

  it("## wire by id", function () {
    let ref = {};
    let wires = {
      a() {
        return hyperHTML.wire(ref, ":a")`<a></a>`;
      },
      p() {
        return hyperHTML.wire(ref, ":p")`<p></p>`;
      }
    };
    expect(wires.a().nodeName.toLowerCase(), "<a> is correct").to.equal("a");
    expect(wires.p().nodeName.toLowerCase(), "<p> is correct").to.equal("p");
    expect(wires.a(), "same wire for <a>").to.equal(wires.a());
    expect(wires.p(), "same wire for <p>").to.equal(wires.p());
  });

  it("## Promises instead of nodes", function () {
    let wrap = document.createElement("div");
    let render = hyperHTML.bind(wrap);
    render`<p>${new Promise(function (r) {
      setTimeout(r, 50, "any");
    })}</p>${new Promise(function (r) {
      setTimeout(r, 10, "virtual");
    })}<hr><div>${[
      new Promise((r) => {
        setTimeout(r, 20, 1);
      }),
      new Promise((r) => {
        setTimeout(r, 10, 2);
      })
    ]}</div>${[
      new Promise((r) => {
        setTimeout(r, 20, 3);
      }),
      new Promise((r) => {
        setTimeout(r, 10, 4);
      })
    ]}`;
    let result = wrap.innerHTML;
    return new Promise(function (resolve) {
      setTimeout(() => {
        expect(result !== wrap.innerHTML, "promises fullfilled").to.be.true;
        expect(
          /^<p>any<!--.+?--><\/p>virtual<!--.+?--><hr(?: ?\/)?><div>12<!--.+?--><\/div>34<!--.+?-->$/.test(
            wrap.innerHTML
          ),
          "both any and virtual content correct"
        ).to.be.true;
        resolve();
      }, 100);
    });
  });

  it("## for code coverage sake", function () {
    let wrap = document.createElement("div");
    let text = [
      document.createTextNode("a"),
      document.createTextNode("b"),
      document.createTextNode("c")
    ];
    let testingMajinBuu = hyperHTML.bind(wrap);
    testingMajinBuu`${text}`;
    expect(wrap.textContent).to.equal("abc");

    text[0] = document.createTextNode("c");
    text[2] = document.createTextNode("a");
    testingMajinBuu`${text}`;
    expect(wrap.textContent).to.equal("cba");

    let result = hyperHTML.wire()`<!--not hyperHTML-->`;
    expect(result.nodeType, "it is a comment").to.equal(8);
    expect(result.textContent, "correct content").to.equal("not hyperHTML");

    hyperHTML.bind(wrap)`<br/>${"node before"}`;
    expect(
      /^<br(?: ?\/)?>node before<!--.+?-->$/i.test(wrap.innerHTML),
      "node before"
    ).to.be.true;

    hyperHTML.bind(wrap)`${"node after"}<br/>`;
    expect(
      /^node after<!--.+?--><br(?: ?\/)?>$/i.test(wrap.innerHTML),
      "node after"
    ).to.be.true;

    hyperHTML.bind(wrap)`<style> ${"hyper-html{}"} </style>`;
    expect(wrap.innerHTML.toLowerCase(), "node style").to.equal(
      "<style>hyper-html{}</style>"
    );

    let empty = (value) => hyperHTML.bind(wrap)`${value}`;
    empty(document.createTextNode("a"));
    empty(document.createDocumentFragment());
    empty(document.createDocumentFragment());
    let fragment = document.createDocumentFragment();
    fragment.appendChild(document.createTextNode("b"));
    empty(fragment);
    empty(123);
    expect(wrap.textContent, "text as number").to.equal("123");
    empty(true);
    expect(wrap.textContent, "text as boolean").to.equal("true");
    empty([1]);
    expect(wrap.textContent, "text as one entry array").to.equal("1");
    empty(["1", "2"]);
    expect(wrap.textContent, "text as multi entry array of strings").to.equal(
      "12"
    );
    let arr = [document.createTextNode("a"), document.createTextNode("b")];
    empty(arr);
    expect(wrap.textContent, "text as multi entry array of nodes").to.equal(
      "ab"
    );
    empty(arr);
    expect(wrap.textContent, "same array of nodes").to.equal("ab");
    empty(wrap.childNodes);
    expect(wrap.textContent, "childNodes as list").to.equal("ab");

    hyperHTML.bind(wrap)`a=${{ length: 1, 0: "b" }}`;
    expect(wrap.textContent, "childNodes as virtual list").to.equal("a=b");
    empty = () => hyperHTML.bind(wrap)`[${"text"}]`;
    empty();
    empty();
    let onclick = (e) => {};
    let handler = { handleEvent: onclick };
    empty = function () {
      return hyperHTML.bind(
        wrap
      )`<p onclick="${onclick}" onmouseover="${handler}" align="${"left"}"></p>`;
    };
    empty();
    handler = { handleEvent: onclick };
    empty();
    empty();
    empty = function (value) {
      return hyperHTML.bind(wrap)`<br/>${value}<br/>`;
    };
    empty(arr[0]);
    empty(arr);
    empty(arr);
    empty([]);
    empty(["1", "2"]);
    empty(document.createDocumentFragment());

    let svgContainer = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    hyperHTML.bind(svgContainer)`<rect x="1" y="2" />`;
    result = hyperHTML.wire(null, "svg")`<svg></svg>`;
    expect(
      result.nodeName.toLowerCase(),
      "svg content is allowed too"
    ).to.equal("svg");
    result = hyperHTML.wire()``;
    expect(result.innerHTML, "empty content").to.be.undefined;
    hyperHTML.wire()`<tr><td>ok</td></tr>`;

    hyperHTML.bind(wrap)`${" 1 "}`;
    expect(wrap.textContent, "text in between").to.equal(" 1 ");

    hyperHTML.bind(wrap)` <br/>${1}<br/> `;
    expect(
      /^\s*<br(?: ?\/)?>1<!--.+?--><br(?: ?\/)?>\s*$/.test(wrap.innerHTML),
      "virtual content in between"
    ).to.be.true;

    let last = hyperHTML.wire();
    empty = function (style) {
      return last`<textarea style=${style}>${() => "same text"}</textarea>`;
    };
    empty("border:0");
    empty({ border: 0 });
    empty({ vh: 100 });
    empty({ vh: 10, vw: 1 });
    empty(null);
    empty("");
    const sameStyle = { ord: 0 };
    empty(sameStyle);
    empty(sameStyle);
    empty = function () {
      return last`<p data=${last}></p>`;
    };
    empty();
    empty();
    let p = last`<p data=${last}>${0}</p>`;
    const UID = p.childNodes[1].data;
    last`<textarea new>${`<!--${UID}-->`}</textarea>`;
    hyperHTML.wire()`<p><!--ok--></p>`;
  });

  it("## <script> shenanigans", function () {
    const div = document.createElement("div");
    document.body.appendChild(div);
    return new Promise(function (resolve) {
      hyperHTML.bind(div)`<script
      src="../index.js?_=asd"
      onreadystatechange="${(event) => {
        if (/loaded|complete/.test(event.readyState))
          setTimeout(() => {
            expect(true, "executed").to.be.true;
            resolve();
          });
      }}"
      onload="${() => {
        expect(true, "executed").to.be.true;
        resolve();
      }}"
      onerror="${() => {
        expect(true, "executed").to.be.true;
        resolve();
      }}"
    ></script>`;
      div.firstChild.dispatchEvent(new CustomEvent("load"));
    });
  });

  it("## SVG and style", function () {
    let render = hyperHTML.wire(null, "svg");
    function rect(style) {
      return render`<rect style=${style} />`;
    }
    let node = rect({});
    rect({ width: 100 });
    expect(
      /width:\s*100px;/.test(node.getAttribute("style")),
      "correct style object"
    ).to.be.true;
    rect("height:10px;");
    expect(
      /height:\s*10px;/.test(node.getAttribute("style")),
      "correct style string"
    ).to.be.true;
    rect(null);
    expect(
      /^(?:|null)$/.test(node.getAttribute("style")),
      "correct style reset"
    ).to.be.true;
  });

  it("Node rendering with attributes", function () {
    const a = document.createTextNode("a");
    const b = document.createTextNode("b");
    const c = document.createTextNode("c");
    const d = document.createTextNode("d");
    const e = document.createTextNode("e");
    const f = document.createTextNode("f");
    const g = document.createTextNode("g");
    const h = document.createTextNode("h");
    const i = document.createTextNode("i");
    const div = document.createElement("div");
    const render = hyperHTML.bind(div);
    render`${[]}`;
    expect(div.textContent, "div is empty").to.equal("");
    render`${[c, d, e, f]}`;
    // all tests know that a comment node is inside the div
    expect(
      div.textContent === "cdef" && div.childNodes.length === 5,
      "div has 4 nodes"
    ).to.be.true;

    render`${[c, d, e, f]}`;
    expect(div.textContent, "div has same 4 nodes").to.equal("cdef");

    render`${[a, b, c, d, e, f]}`;
    expect(
      div.textContent === "abcdef" && div.childNodes.length === 7,
      "div has same 4 nodes + 2 prepends"
    ).to.be.true;

    render`${[a, b, c, d, e, f, g, h, i]}`;
    expect(
      div.textContent === "abcdefghi" && div.childNodes.length === 10,
      "div has 6 nodes + 3 appends"
    ).to.be.true;

    render`${[b, c, d, e, f, g, h, i]}`;
    expect(
      div.textContent === "bcdefghi" && div.childNodes.length === 9,
      "div has dropped first node"
    ).to.be.true;

    render`${[b, c, d, e, f, g, h]}`;
    expect(
      div.textContent === "bcdefgh" && div.childNodes.length === 8,
      "div has dropped last node"
    ).to.be.true;

    render`${[b, c, d, f, e, g, h]}`;
    expect(div.textContent, "div has changed 2 nodes").to.equal("bcdfegh");

    render`${[b, d, c, f, g, e, h]}`;
    expect(div.textContent, "div has changed 4 nodes").to.equal("bdcfgeh");

    render`${[b, d, c, g, e, h]}`;
    expect(
      div.textContent === "bdcgeh" && div.childNodes.length === 7,
      "div has removed central node"
    ).to.be.true;
  });

  it("# no WebKit backfire", function () {
    const div = document.createElement("div");
    function update(value, attr) {
      return hyperHTML.bind(div)`<input value="${value}" shaka="${attr}">`;
    }
    const input = update("", "").firstElementChild;
    input.value = "456";
    input.setAttribute("shaka", "laka");
    update("123", "laka");
    expect(input.value, "correct input").to.equal("123");
    expect(input.value, "correct attribute").to.equal("123");
    update("", "");
    input.value = "123";
    input.attributes.shaka.value = "laka";
    update("123", "laka");
    expect(input.value, "input.value was not reassigned").to.equal("123");
  });

  it("# wired arrays are rendered properly", function () {
    const div = document.createElement("div");
    const employees = [
      { first: "Bob", last: "Li" },
      { first: "Ayesha", last: "Johnson" }
    ];
    const getEmployee = (employee) => hyperHTML.wire(employee)`
      <div>First name: ${employee.first}</div><p></p>`;
    hyperHTML.bind(div)`${employees.map(getEmployee)}`;
    expect(div.childElementCount, "correct elements as setAny").to.equal(4);

    hyperHTML.bind(div)`<p></p>${employees.map(getEmployee)}`;
    expect(div.childElementCount, "correct elements as setVirtual").to.equal(5);

    hyperHTML.bind(div)`<p></p>${[]}`;
    expect(div.childElementCount, "only one element left").to.equal(1);
  });

  it("# wired arrays are rendered properly with empty array item", function () {
    const div = document.createElement("div");
    const employees = [
      { first: "Bob", last: "Li" },
      { first: "Ayesha", last: "Johnson" }
    ];
    const getEmployee = (employee) => hyperHTML.wire(employee)`
      <div>First name: ${employee.first}</div><p></p>`;
    hyperHTML.bind(div)`${employees.map(getEmployee)}`;
    expect(div.childElementCount, "correct elements as setAny").to.equal(4);

    const array = employees.map(getEmployee);
    array.push(null);
    array.unshift(null);
    hyperHTML.bind(div)`<p></p>${array}`;
    expect(div.childElementCount, "correct elements as setVirtual").to.equal(5);

    hyperHTML.bind(div)`<p></p>${[]}`;
    expect(div.childElementCount, "only one element left").to.equal(1);
  });

  it("# textarea text", function () {
    const div = document.createElement("div");
    function textarea(value) {
      return hyperHTML.bind(div)`<textarea>${value}</textarea>`;
    }
    textarea(1);
    const ta = div.firstElementChild;
    expect(ta.textContent, "primitives are fine").to.equal("1");
    textarea(null);
    expect(ta.textContent, "null/undefined is fine").to.equal("");
    const p = Promise.resolve("OK");
    textarea(p);
    return p.then(function () {
      expect(ta.textContent, "promises are fine").to.equal("OK");
      textarea({ text: "text" });
      expect(ta.textContent, "text is fine").to.equal("text");
      textarea({ html: "html" });
      expect(ta.textContent, "html is fine").to.equal("html");
      textarea({ any: "any" });
      expect(ta.textContent, "any is fine").to.equal("any");
      textarea(["ar", "ray"]);
      expect(ta.textContent, "array is fine").to.equal("array");
      textarea({ placeholder: "placeholder" });
      expect(ta.textContent, "placeholder is fine").to.equal("placeholder");
      textarea({ unknown: "unknown" });
      expect(ta.textContent, "intents are fine").to.equal("");
    });
  });

  it("# attributes with weird chars", function () {
    const div = document.createElement("div");
    hyperHTML.bind(div)`<p _foo=${"bar"}></p>`;
    expect(div.firstChild.getAttribute("_foo"), "OK").to.equal("bar");
  });

  it("# attributes without quotes", function () {
    const div = document.createElement("div");
    hyperHTML.bind(div)`<p test=${'a"b'}></p>`;
    expect(div.firstChild.getAttribute("test"), "OK").to.equal('a"b');
  });

  it("# any content extras", function () {
    const div = document.createElement("div");
    const html = hyperHTML.bind(div);
    setContent(undefined);
    expect(/<p><!--.+?--><\/p>/.test(div.innerHTML), "expected layout").to.be
      .true;
    setContent({ text: "<img/>" });
    expect(
      /<p>&lt;img(?: ?\/)?&gt;<!--.+?--><\/p>/.test(div.innerHTML),
      "expected text"
    ).to.be.true;
    function setContent(which) {
      return html`<p>${which}</p>`;
    }
  });

  it("# any different content extras", function () {
    const div = document.createElement("div");
    hyperHTML.bind(div)`<p>${undefined}</p>`;
    expect(/<p><!--.+?--><\/p>/.test(div.innerHTML), "expected layout").to.be
      .true;
    hyperHTML.bind(div)`<p>${{ text: "<img/>" }}</p>`;
    expect(
      /<p>&lt;img(?: ?\/)?&gt;<!--.+?--><\/p>/.test(div.innerHTML),
      "expected text"
    ).to.be.true;
  });

  it("# virtual content extras", function () {
    const div = document.createElement("div");
    hyperHTML.bind(div)`a ${null}`;
    expect(/a <[^>]+?>/.test(div.innerHTML), "expected layout").to.be.true;
    hyperHTML.bind(div)`a ${{ text: "<img/>" }}`;
    expect(
      /a &lt;img(?: ?\/)?&gt;<[^>]+?>/.test(div.innerHTML),
      "expected text"
    ).to.be.true;
    hyperHTML.bind(div)`a ${{ any: 123 }}`;
    expect(/a 123<[^>]+?>/.test(div.innerHTML), "expected any").to.be.true;
    hyperHTML.bind(div)`a ${{ html: "<b>ok</b>" }}`;
    expect(/a <b>ok<\/b><[^>]+?>/.test(div.innerHTML), "expected html").to.be
      .true;
    hyperHTML.bind(div)`a ${{}}`;
    expect(/a <[^>]+?>/.test(div.innerHTML), "expected nothing").to.be.true;
  });

  it("# defined transformer", function () {
    hyperHTML.define("eUC", encodeURIComponent);
    const div = document.createElement("div");
    hyperHTML.bind(div)`a=${{ eUC: "b c" }}`;
    expect(div.textContent, "correct encoding").to.equal("a=b%20c");
    expect(/a=b%20c<[^>]+?>/.test(div.innerHTML), "expected virtual layout").to
      .be.true;

    hyperHTML.bind(div)`<p>${{ eUC: "b c" }}</p>`;
    expect(/<p>b%20c<!--.+?--><\/p>/.test(div.innerHTML), "expected layout").to
      .be.true;
  });

  it("# attributes with null values", function () {
    const div = document.createElement("div");
    const anyAttr = function (value) {
      hyperHTML.bind(div)`<p any-attr=${value}>any content</p>`;
    };
    anyAttr("1");
    expect(
      div.firstChild.hasAttribute("any-attr") &&
        div.firstChild.getAttribute("any-attr") === "1",
      "regular attribute"
    ).to.be.true;
    anyAttr(null);
    expect(
      !div.firstChild.hasAttribute("any-attr") &&
        div.firstChild.getAttribute("any-attr") == null,
      "can be removed"
    ).to.be.true;
    anyAttr(undefined);
    expect(
      !div.firstChild.hasAttribute("any-attr") &&
        div.firstChild.getAttribute("any-attr") == null,
      "multiple times"
    ).to.be.true;
    anyAttr("2");
    expect(
      div.firstChild.hasAttribute("any-attr") &&
        div.firstChild.getAttribute("any-attr") === "2",
      "but can be also reassigned"
    ).to.be.true;
    anyAttr("3");
    expect(
      div.firstChild.hasAttribute("any-attr") &&
        div.firstChild.getAttribute("any-attr") === "3",
      "many other times"
    ).to.be.true;
    const inputName = function (value) {
      hyperHTML.bind(div)`<input name=${value}>`;
    };
    inputName("test");
    expect(
      div.firstChild.hasAttribute("name") && div.firstChild.name === "test",
      "special attributes are set too"
    ).to.be.true;
    inputName(null);
    expect(
      !div.firstChild.hasAttribute("name") && !div.firstChild.name,
      "but can also be removed"
    ).to.be.true;
    inputName(undefined);
    expect(
      !div.firstChild.hasAttribute("name") && !div.firstChild.name,
      "with either null or undefined"
    ).to.be.true;
    inputName("back");
    expect(
      div.firstChild.hasAttribute("name") && div.firstChild.name === "back",
      "and can be put back"
    ).to.be.true;
  });

  it("# placeholder", function () {
    const div = document.createElement("div");
    const vdiv = document.createElement("div");
    hyperHTML.bind(div)`<p>${{ eUC: "b c", placeholder: "z" }}</p>`;
    hyperHTML.bind(vdiv)`a=${{ eUC: "b c", placeholder: "z" }}`;
    expect(
      /<p>z<!--.+?--><\/p>/.test(div.innerHTML),
      "expected inner placeholder layout"
    ).to.be.true;
    expect(
      /a=z<[^>]+?>/.test(vdiv.innerHTML),
      "expected virtual placeholder layout"
    ).to.be.true;
    return new Promise(function (resolve) {
      setTimeout(function () {
        expect(
          /<p>b%20c<!--.+?--><\/p>/.test(div.innerHTML),
          "expected inner resolved layout"
        ).to.be.true;
        expect(
          /a=b%20c<[^>]+?>/.test(vdiv.innerHTML),
          "expected virtual resolved layout"
        ).to.be.true;
        hyperHTML.bind(div)`<p>${{ text: 1, placeholder: "9" }}</p>`;
        setTimeout(function () {
          expect(
            /<p>1<!--.+?--><\/p>/.test(div.innerHTML),
            "placeholder with text"
          ).to.be.true;
          hyperHTML.bind(div)`<p>${{ any: [1, 2], placeholder: "9" }}</p>`;
          setTimeout(function () {
            expect(
              /<p>12<!--.+?--><\/p>/.test(div.innerHTML),
              "placeholder with any"
            ).to.be.true;
            hyperHTML.bind(
              div
            )`<p>${{ html: "<b>3</b>", placeholder: "9" }}</p>`;
            setTimeout(function () {
              expect(
                /<p><b>3<\/b><!--.+?--><\/p>/.test(div.innerHTML),
                "placeholder with html"
              ).to.be.true;
              resolve();
            }, 10);
          }, 10);
        }, 10);
      }, 10);
    });
  });

  it("## hyper(...)", function () {
    const hyper = hyperHTML.hyper;
    expect(typeof hyper(), "function").to.equal("function");
    expect(hyper`abc`.textContent, "abc").to.equal("abc");
    expect(hyper`<p>a${2}c</p>`.textContent, "a2c").to.equal("a2c");
    expect(
      hyper(document.createElement("div"))`abc`.textContent,
      "abc"
    ).to.equal("abc");
    expect(
      hyper(document.createElement("div"))`a${"b"}c`.textContent,
      "abc"
    ).to.equal("abc");

    expect(hyper({})`abc`.textContent, "abc").to.equal("abc");
    expect(hyper({})`<p>a${"b"}c</p>`.textContent, "abc").to.equal("abc");
    expect(hyper({}, ":id")`abc`.textContent, "abc").to.equal("abc");
    expect(hyper({}, ":id")`<p>a${"b"}c</p>`.textContent, "abc").to.equal(
      "abc"
    );
    expect(hyper("svg")`<rect />`, "hyper('svg')`<rect />`").to.be.exist;
  });

  it("## data=${anyContent}", function () {
    const obj = { rand: Math.random() };
    const div = hyperHTML.wire()`<div data=${obj}>abc</div>`;
    expect(div.data, "data available without serialization").to.equal(obj);
    expect(div.outerHTML, "attribute not there").to.equal("<div>abc</div>");
  });

  it("## Custom Element attributes", function () {
    class DumbElement extends window.HTMLElement {
      dumb = null;
      asd = null;
    }
    window.customElements.define("dumb-element", DumbElement);
    function update(wire) {
      return wire`<div>
      <dumb-element dumb=${true} asd=${"qwe"}></dumb-element><dumber-element dumb=${true}></dumber-element>
    </div>`;
    }
    const div = update(hyperHTML.wire());
    if (!(div.firstElementChild instanceof DumbElement)) {
      expect(
        div.firstElementChild.dumb !== true,
        "not upgraded elements does not have special attributes"
      ).to.be.true;
      expect(
        div.lastElementChild.dumb !== true,
        "unknown elements never have special attributes"
      ).to.be.true;
      // simulate an upgrade
      div.firstElementChild.constructor.prototype.dumb = null;
    }
    update(hyperHTML.wire());
    delete div.firstElementChild.constructor.prototype.dumb;
    expect(
      div.firstElementChild.dumb === true,
      "upgraded elements have special attributes"
    ).to.be.true;
  });

  it("## splice and sort", function () {
    const todo = [
      { id: 0, text: "write documentation" },
      { id: 1, text: "publish online" },
      { id: 2, text: "create Code Pen" }
    ];
    const div = document.createElement("div");
    update();
    todo.sort(function (a, b) {
      return a.text < b.text ? -1 : 1;
    });
    update();
    expect(
      /^\s+create Code Pen\s*publish online\s*write documentation\s+$/.test(
        div.textContent
      ),
      "correct order"
    ).to.be.true;
    function update() {
      hyperHTML.bind(div)`<ul>
      ${todo.map(function (item) {
        return hyperHTML.wire(item)`<li data-id=${item.id}>${item.text}</li>`;
      })}
    </ul>`;
    }
  });

  it("## style=${fun}", function () {
    const render = hyperHTML.wire();
    function p(style) {
      return render`<p style=${style}></p>`;
    }
    const node = p({ fontSize: 24 });
    expect(node.style.fontSize, node.style.fontSize).to.equal("24px");

    p({});
    expect(node.style.fontSize, "object cleaned").to.equal("");

    p({ "--custom-color": "red" });
    expect(
      node.style.getPropertyValue("--custom-color"),
      "custom style"
    ).to.equal("red");
  });

  it("## <self-closing />", function () {
    const div = hyperHTML.wire()`<div><self-closing test=${1} /><input /><self-closing test="2" /></div>`;
    expect(div.childNodes.length === 3, "nodes did self close").to.be.true;
    expect(div.childNodes[0].getAttribute("test") == "1", "first node ok").to.be
      .true;
    expect(/input/i.test(div.childNodes[1].nodeName), "second node ok").to.be
      .true;
    expect(div.childNodes[2].getAttribute("test") == "2", "third node ok").to.be
      .true;
    const div2 = hyperHTML.wire()`<div>
    <self-closing
      test=1
    /><input
    /><self-closing test="2"
     />
     </div>`;
    expect(div2.children.length === 3, "nodes did self close").to.be.true;
    expect(div2.children[0].getAttribute("test") == "1", "first node ok").to.be
      .true;
    expect(/input/i.test(div2.children[1].nodeName), "second node ok").to.be
      .true;
    expect(div2.children[2].getAttribute("test") == "2", "third node ok").to.be
      .true;
    const div3 = hyperHTML.wire()`<div style="width: 200px;">
        <svg viewBox="0 0 30 30" fill="currentColor">
          <path d="M 0,27 L 27,0 L 30,3 L 3,30 Z" />
          <path d="M 0,3 L 3,0 L 30,27 L 27,30 Z" />
        </svg>
      </div>`;
    expect(div3.children.length === 1, "one svg").to.be.true;
    expect(div3.querySelectorAll("path").length === 2, "two paths").to.be.true;
  });

  it("## <with><self-closing /></with>", function () {
    function check(form) {
      return (
        form.children.length === 3 &&
        /label/i.test(form.children[0].nodeName) &&
        /input/i.test(form.children[1].nodeName) &&
        /button/i.test(form.children[2].nodeName)
      );
    }
    expect(
      check(hyperHTML.wire()`
    <form onsubmit=${check}>
      <label/>
      <input type="email" placeholder="email">
      <button>Button</button>
    </form>`),
      "no quotes is OK"
    ).to.be.true;
    expect(
      check(hyperHTML.wire()`
    <form onsubmit=${check}>
      <label />
      <input type="email" placeholder="email"/>
      <button>Button</button>
    </form>`),
      "self closing is OK"
    ).to.be.true;
    expect(
      check(hyperHTML.wire()`
    <form onsubmit="${check}">
      <label/>
      <input type="email" placeholder="email">
      <button>Button</button>
    </form>`),
      "quotes are OK"
    ).to.be.true;
    expect(
      check(hyperHTML.wire()`
    <form onsubmit="${check}">
      <label/>
      <input type="email" placeholder="email" />
      <button>Button</button>
    </form>`),
      "quotes and self-closing too OK"
    ).to.be.true;
  });

  it("## slotted callback", function () {
    const div = document.createElement("div");
    const result = [];
    function A() {
      result.push(arguments);
      return { html: "<b>a</b>" };
    }
    function B() {
      result.push(arguments);
      return { html: "<b>b</b>" };
    }
    function update() {
      hyperHTML.bind(div)`${A} - ${B}`;
    }
    update();
    expect(result[0][0].parentNode, "expected parent node for A").to.equal(div);
    expect(result[1][0].parentNode, "expected parent node for B").to.equal(div);
  });

  it("## define(hyper-attribute, callback)", function () {
    const a = document.createElement("div");
    const random = Math.random();
    const result = [];
    hyperHTML.define("hyper-attribute", function (target, value) {
      result.push(target, value);
      return random;
    });
    hyperHTML.bind(a)`<p hyper-attribute=${random}/>`;
    if (!result.length) throw new Error("attributes intents failed");
    else {
      expect(result[0], "expected target").to.equal(a.firstElementChild);
      expect(result[1], "expected value").to.equal(random);
      expect(
        a.firstElementChild.getAttribute("hyper-attribute"),
        "expected attribute"
      ).to.equal(`${random}`);
    }
    result.splice(0);
    hyperHTML.define("other-attribute", function (target, value) {
      result.push(target, value);
      return "";
    });
    hyperHTML.define("disappeared-attribute", function (target, value) {});
    hyperHTML.define("whatever-attribute", function (target, value) {
      return value;
    });
    hyperHTML.define("null-attribute", function (target, value) {
      return null;
    });
    hyperHTML.bind(a)`<p
        other-attribute=${random}
        disappeared-attribute=${random}
        whatever-attribute=${random}
        null-attribute=${random}
      />`;
    if (!result.length) throw new Error("attributes intents failed");
    else {
      expect(result[0], "expected other target").to.equal(a.firstElementChild);
      expect(result[1], "expected other value").to.equal(random);
      expect(
        a.firstElementChild.getAttribute("other-attribute"),
        "expected other attribute"
      ).to.equal("");
      expect(
        !a.firstElementChild.hasAttribute("disappeared-attribute"),
        "disappeared-attribute removed"
      ).to.be.true;
      expect(
        a.firstElementChild.getAttribute("whatever-attribute"),
        "whatever-attribute set"
      ).to.equal(`${random}`);
      expect(
        !a.firstElementChild.hasAttribute("null-attribute"),
        "null-attribute removed"
      ).to.be.true;
    }
  });

  it("## A-Frame compatibility", function () {
    const output = hyperHTML.wire()`<a-scene></a-scene>`;
    expect(output.nodeName.toLowerCase(), "correct element").to.equal(
      "a-scene"
    );
  });
});
