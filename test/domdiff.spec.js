import { expect } from "chai";
import domdiff from "../src/objects/domdiff.js";

describe("domdiff", () => {
  let nodes;
  let beforeNode;

  const identity = (O) => O;

  const notNull = function (any) {
    return any != null;
  };

  const compare = function (state, value) {
    expect(
      state.length === value.length &&
        value.split("").every((v, i) => state[i] === nodes[v]),
      value || "[empy]"
    ).to.be.true;
    if (document.body.textContent) {
      expect(state.every((node, i) => document.body.childNodes[i] === node)).to
        .be.true;
    }
  };

  before(function () {
    nodes = {
      a: document.createTextNode("a"),
      b: document.createTextNode("b"),
      c: document.createTextNode("c"),
      d: document.createTextNode("d"),
      e: document.createTextNode("e"),
      f: document.createTextNode("f"),
      g: document.createTextNode("g"),
      h: document.createTextNode("h"),
      i: document.createTextNode("i"),
      j: document.createTextNode("j"),
      k: document.createTextNode("k")
    };
    beforeNode = document.createTextNode("-");
  });

  beforeEach(function () {
    document.body.innerHTML = "";
  });

  it("diff case #1", () => {
    let futureState = domdiff(
      document.body,
      [],
      [nodes.b, nodes.c, nodes.d],
      identity
    );
    compare(futureState, "bcd");

    // same list, no changes
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.b, nodes.c, nodes.d],
      identity
    );
    compare(futureState, "bcd");

    // more on the left
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.a, nodes.b, nodes.c, nodes.d],
      identity
    );
    compare(futureState, "abcd");

    // more on the right
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e, nodes.f],
      identity
    );
    compare(futureState, "abcdef");

    // more in the middle
    futureState = domdiff(
      document.body,
      futureState,
      [
        nodes.a,
        nodes.b,
        nodes.c,
        nodes.g,
        nodes.h,
        nodes.i,
        nodes.d,
        nodes.e,
        nodes.f
      ],
      identity
    );
    compare(futureState, "abcghidef");

    // drop from right
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.a, nodes.b, nodes.c, nodes.g, nodes.h, nodes.i, nodes.d, nodes.e],
      identity
    );
    compare(futureState, "abcghide");

    // drop from left
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.c, nodes.g, nodes.h, nodes.i, nodes.d, nodes.e],
      identity
    );
    compare(futureState, "cghide");

    // drop in between
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.c, nodes.g, nodes.d, nodes.e],
      identity
    );
    compare(futureState, "cgde");

    // move node to another parent
    var fragment = document.body.ownerDocument.createDocumentFragment();
    fragment.appendChild(nodes.g);
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.c, nodes.d, nodes.e],
      identity
    );
    compare(futureState, "cde");
    expect(nodes.g.parentNode === fragment).to.be.true;

    // drop all nodes
    futureState = domdiff(document.body, futureState, [], identity);
    compare(futureState, "");
  });

  it("diff case #2", () => {
    let futureState = [];
    domdiff(document.body, futureState, [beforeNode], identity);

    futureState = domdiff(
      document.body,
      futureState,
      [nodes.b, nodes.c, nodes.d],
      identity,
      beforeNode
    );
    compare(futureState, "bcd");

    // same list, no changes with before
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.b, nodes.c, nodes.d],
      identity,
      beforeNode
    );
    compare(futureState, "bcd");

    // more on the left with before
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.a, nodes.b, nodes.c, nodes.d],
      identity,
      beforeNode
    );
    compare(futureState, "abcd");

    // more on the right with before
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e, nodes.f],
      identity,
      beforeNode
    );
    compare(futureState, "abcdef");

    // more in the middle with before
    futureState = domdiff(
      document.body,
      futureState,
      [
        nodes.a,
        nodes.b,
        nodes.c,
        nodes.g,
        nodes.h,
        nodes.i,
        nodes.d,
        nodes.e,
        nodes.f
      ],
      identity,
      beforeNode
    );
    compare(futureState, "abcghidef");

    // drop from right with before
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.a, nodes.b, nodes.c, nodes.g, nodes.h, nodes.i, nodes.d, nodes.e],
      identity,
      beforeNode
    );
    compare(futureState, "abcghide");

    // drop from left with before
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.c, nodes.g, nodes.h, nodes.i, nodes.d, nodes.e],
      identity,
      beforeNode
    );
    compare(futureState, "cghide");

    // drop in between with before
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.c, nodes.g, nodes.d, nodes.e],
      identity,
      beforeNode
    );
    compare(futureState, "cgde");

    // drop one in between with before
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.c, nodes.g, nodes.e],
      identity,
      beforeNode
    );
    compare(futureState, "cge");

    // drop all nodes with before
    futureState = domdiff(document.body, futureState, [], identity, beforeNode);
    compare(futureState, "");

    futureState = domdiff(
      document.body,
      futureState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e, nodes.f],
      identity,
      beforeNode
    );
    compare(futureState, "abcdef");

    // partial substitution one to many
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.a, nodes.b, nodes.g, nodes.i, nodes.d, nodes.e, nodes.f],
      identity,
      beforeNode
    );
    compare(futureState, "abgidef");

    // partial substitution many to o e
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e, nodes.f],
      identity,
      beforeNode
    );
    compare(futureState, "abcdef");

    // inner diff
    futureState = domdiff(
      document.body,
      futureState,
      [
        nodes.j,
        nodes.g,
        nodes.a,
        nodes.b,
        nodes.c,
        nodes.d,
        nodes.e,
        nodes.f,
        nodes.h,
        nodes.i
      ],
      identity,
      beforeNode
    );
    compare(futureState, "jgabcdefhi");

    // outer diff
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e, nodes.f],
      identity,
      beforeNode
    );
    compare(futureState, "abcdef");

    // fuzzy diff
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.a, nodes.g, nodes.c, nodes.d, nodes.h, nodes.i],
      identity,
      beforeNode
    );
    compare(futureState, "agcdhi");

    // fuzzy diff
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.i, nodes.g, nodes.a, nodes.d, nodes.h, nodes.c],
      identity,
      beforeNode
    );
    compare(futureState, "igadhc");

    // reversed diff
    futureState = domdiff(
      document.body,
      futureState,
      [nodes.c, nodes.h, nodes.d, nodes.a, nodes.g, nodes.i],
      identity,
      beforeNode
    );
    compare(futureState, "chdagi");
  });

  it("diff case #3", () => {
    let newState = domdiff(
      document.body,
      [],
      [nodes.d, nodes.f, nodes.g],
      identity
    );
    compare(newState, "dfg");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c].concat(newState),
      identity
    );
    compare(newState, "abcdfg");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e, nodes.f, nodes.g],
      identity
    );
    compare(newState, "abcdefg");

    newState = domdiff(
      document.body,
      newState,
      newState.slice().reverse(),
      identity
    );
    compare(newState, "gfedcba");

    newState = domdiff(
      document.body,
      newState,
      [nodes.f, nodes.d, nodes.b, nodes.a, nodes.e, nodes.g],
      identity
    );
    compare(newState, "fdbaeg");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e, nodes.f],
      identity
    );
    compare(newState, "abcdef");

    newState = domdiff(
      document.body,
      newState,
      [
        nodes.a,
        nodes.b,
        nodes.c,
        nodes.d,
        nodes.e,
        nodes.f,
        nodes.h,
        nodes.i,
        nodes.j
      ],
      identity
    );
    compare(newState, "abcdefhij");

    newState = domdiff(
      document.body,
      newState,
      [
        nodes.a,
        nodes.b,
        nodes.c,
        nodes.d,
        nodes.e,
        nodes.f,
        nodes.g,
        nodes.h,
        nodes.i,
        nodes.j,
        nodes.k
      ],
      identity
    );
    compare(newState, "abcdefghijk");

    newState = domdiff(
      document.body,
      newState,
      [nodes.g, nodes.h, nodes.i],
      identity
    );
    compare(newState, "ghi");

    document.body.insertBefore(nodes.f, nodes.g);
    compare([].slice.call(document.body.childNodes), "fghi");
  });

  it("diff case #4", () => {
    document.body.appendChild(nodes.k);
    let newState = domdiff(
      document.body,
      [],
      [nodes.c, nodes.d, nodes.e],
      identity,
      nodes.k
    );
    compare(newState, "cde");

    newState = domdiff(
      document.body,
      newState,
      [null, nodes.c, nodes.d, nodes.e, null].filter(notNull),
      identity,
      nodes.k
    );
    compare(newState.filter(notNull), "cde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.c, null, nodes.e, nodes.f].filter(notNull),
      identity,
      nodes.k
    );
    compare(newState.filter(notNull), "acef");

    newState = domdiff(
      document.body,
      newState,
      [nodes.c, nodes.d, nodes.e, nodes.g, nodes.h, nodes.i],
      identity,
      nodes.k
    );
    compare(newState, "cdeghi");

    newState = domdiff(
      document.body,
      newState,
      [
        nodes.a,
        nodes.b,
        nodes.c,
        nodes.d,
        nodes.e,
        nodes.f,
        nodes.g,
        nodes.h,
        nodes.i
      ],
      identity,
      nodes.k
    );
    compare(newState, "abcdefghi");

    newState = domdiff(
      document.body,
      newState,
      [
        nodes.b,
        nodes.a,
        nodes.c,
        nodes.d,
        nodes.e,
        nodes.f,
        nodes.g,
        nodes.i,
        nodes.h
      ],
      identity,
      nodes.k
    );
    compare(newState, "bacdefgih");

    newState = domdiff(document.body, newState, [], identity, nodes.k);
    compare(newState, "");

    // https://github.com/snabbdom/snabbdom/blob/master/test/core.js
    // ## snabbdom - updating children
    newState = domdiff(document.body, newState, [nodes.a], identity, nodes.k);
    compare(newState, "a");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c],
      identity,
      nodes.k
    );
    compare(newState, "abc");

    newState = domdiff(
      document.body,
      newState,
      [nodes.d, nodes.e],
      identity,
      nodes.k
    );
    compare(newState, "de");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e],
      identity,
      nodes.k
    );
    compare(newState, "abcde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.d, nodes.e],
      identity,
      nodes.k
    );
    compare(newState, "abde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e],
      identity,
      nodes.k
    );
    compare(newState, "abcde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.b, nodes.c, nodes.d],
      identity,
      nodes.k
    );
    compare(newState, "bcd");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e],
      identity,
      nodes.k
    );
    compare(newState, "abcde");

    newState = domdiff(document.body, newState, [], identity, nodes.k);
    compare(newState, "");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c],
      identity,
      nodes.k
    );
    compare(newState, "abc");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, document.createTextNode("b"), nodes.c],
      identity,
      nodes.k
    );
    expect(
      newState[1] !== nodes.b &&
        newState.length === 3 &&
        newState[0] === nodes.a &&
        newState[2] === nodes.c,
      "replace one child"
    ).to.be.true;

    // ## snabbdom - removal of elements
    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e],
      identity,
      nodes.k
    );
    compare(newState, "abcde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.c, nodes.d, nodes.e],
      identity,
      nodes.k
    );
    compare(newState, "cde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e],
      identity,
      nodes.k
    );
    compare(newState, "abcde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c],
      identity,
      nodes.k
    );
    compare(newState, "abc");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e],
      identity,
      nodes.k
    );
    compare(newState, "abcde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.d, nodes.e],
      identity,
      nodes.k
    );
    compare(newState, "abde");

    // ## snabbdom - element reordering
    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d],
      identity,
      nodes.k
    );
    compare(newState, "abcd");

    newState = domdiff(
      document.body,
      newState,
      [nodes.b, nodes.c, nodes.a, nodes.d],
      identity,
      nodes.k
    );
    compare(newState, "bcad");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c],
      identity,
      nodes.k
    );
    compare(newState, "abc");

    newState = domdiff(
      document.body,
      newState,
      [nodes.b, nodes.c, nodes.a, nodes.d],
      identity,
      nodes.k
    );
    compare(newState, "bcad");

    newState = domdiff(
      document.body,
      newState,
      [nodes.c, nodes.b, nodes.d],
      identity,
      nodes.k
    );
    compare(newState, "cbd");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c],
      identity,
      nodes.k
    );
    compare(newState, "abc");

    newState = domdiff(
      document.body,
      newState,
      [nodes.b, nodes.c, nodes.a],
      identity,
      nodes.k
    );
    compare(newState, "bca");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d],
      identity,
      nodes.k
    );
    compare(newState, "abcd");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.d, nodes.b, nodes.c],
      identity,
      nodes.k
    );
    compare(newState, "adbc");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.d, nodes.b, nodes.c],
      identity,
      nodes.k
    );
    compare(newState, "adbc");

    // ## snabbdom - combination
    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e],
      identity,
      nodes.k
    );
    compare(newState, "abcde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.d, nodes.a, nodes.b, nodes.c, nodes.f],
      identity,
      nodes.k
    );
    compare(newState, "dabcf");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.d, nodes.e],
      identity,
      nodes.k
    );
    compare(newState, "ade");

    newState = domdiff(
      document.body,
      newState,
      [nodes.d, nodes.f],
      identity,
      nodes.k
    );
    compare(newState, "df");

    newState = domdiff(
      document.body,
      newState,
      [nodes.b, nodes.d, nodes.e],
      identity,
      nodes.k
    );
    compare(newState, "bde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.d, nodes.e, nodes.c],
      identity,
      nodes.k
    );
    compare(newState, "dec");

    newState = domdiff(
      document.body,
      newState,
      [nodes.j, nodes.a, nodes.b, nodes.c],
      identity,
      nodes.k
    );
    compare(newState, "jabc");

    newState = domdiff(
      document.body,
      newState,
      [nodes.d, nodes.a, nodes.b, nodes.c, nodes.j, nodes.e],
      identity,
      nodes.k
    );
    compare(newState, "dabcje");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e, nodes.f, nodes.g, nodes.h],
      identity,
      nodes.k
    );
    compare(newState, "abcdefgh");

    newState = domdiff(
      document.body,
      newState,
      [
        nodes.a,
        nodes.b,
        nodes.c,
        nodes.d,
        nodes.e,
        nodes.f,
        nodes.g,
        nodes.h
      ].reverse(),
      identity,
      nodes.k
    );
    compare(newState, "hgfedcba");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e, nodes.f],
      identity,
      nodes.k
    );
    compare(newState, "abcdef");

    newState = domdiff(
      document.body,
      newState,
      [nodes.e, nodes.d, nodes.c, nodes.b, nodes.f, nodes.a],
      identity,
      nodes.k
    );
    compare(newState, "edcbfa");

    // ## snabbdom - random values
    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e, nodes.f],
      identity,
      nodes.k
    );
    compare(newState, "abcdef");

    newState = domdiff(
      document.body,
      newState,
      [
        null,
        nodes.c,
        undefined,
        null,
        nodes.b,
        nodes.a,
        null,
        nodes.f,
        nodes.e,
        null,
        nodes.d,
        undefined
      ].filter(notNull),
      identity,
      nodes.k
    );
    compare(newState.filter(notNull), "cbafed");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e, nodes.f],
      identity,
      nodes.k
    );
    compare(newState, "abcdef");

    newState = domdiff(
      document.body,
      newState,
      [null, null, undefined, null, null, undefined].filter(notNull),
      identity,
      nodes.k
    );
    compare(newState.filter(notNull), "");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e, nodes.f].reverse(),
      identity,
      nodes.k
    );
    compare(newState, "fedcba");
  });

  it("diff case #5", () => {
    // ## snabbdom - updating children (unpinned)"
    let newState = domdiff(document.body, [], [nodes.a], identity);
    compare(newState, "a");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c],
      identity
    );
    compare(newState, "abc");

    newState = domdiff(document.body, newState, [nodes.d, nodes.e], identity);
    compare(newState, "de");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e],
      identity
    );
    compare(newState, "abcde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.d, nodes.e],
      identity
    );
    compare(newState, "abde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e],
      identity
    );
    compare(newState, "abcde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.b, nodes.c, nodes.d],
      identity
    );
    compare(newState, "bcd");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e],
      identity
    );
    compare(newState, "abcde");

    newState = domdiff(document.body, newState, [], identity);
    compare(newState, "");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c],
      identity
    );
    compare(newState, "abc");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, document.createTextNode("b"), nodes.c],
      identity
    );
    expect(
      newState[1] !== nodes.b &&
        newState.length === 3 &&
        newState[0] === nodes.a &&
        newState[2] === nodes.c,
      "replace one child"
    ).to.be.true;

    // ## snabbdom - removal of elements (unpinned)
    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e],
      identity
    );
    compare(newState, "abcde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.c, nodes.d, nodes.e],
      identity
    );
    compare(newState, "cde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e],
      identity
    );
    compare(newState, "abcde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c],
      identity
    );
    compare(newState, "abc");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e],
      identity
    );
    compare(newState, "abcde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.d, nodes.e],
      identity
    );
    compare(newState, "abde");

    // ## snabbdom - element reordering (unpinned)
    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d],
      identity
    );
    compare(newState, "abcd");

    newState = domdiff(
      document.body,
      newState,
      [nodes.b, nodes.c, nodes.a, nodes.d],
      identity
    );
    compare(newState, "bcad");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c],
      identity
    );
    compare(newState, "abc");

    newState = domdiff(
      document.body,
      newState,
      [nodes.b, nodes.c, nodes.a],
      identity
    );
    compare(newState, "bca");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d],
      identity
    );
    compare(newState, "abcd");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.d, nodes.b, nodes.c],
      identity
    );
    compare(newState, "adbc");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.d, nodes.b, nodes.c],
      identity
    );
    compare(newState, "adbc");

    // ## snabbdom - combination (unpinned)
    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e],
      identity
    );
    compare(newState, "abcde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.d, nodes.a, nodes.b, nodes.c, nodes.f],
      identity
    );
    compare(newState, "dabcf");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.d, nodes.e],
      identity
    );
    compare(newState, "ade");

    newState = domdiff(document.body, newState, [nodes.d, nodes.f], identity);
    compare(newState, "df");

    newState = domdiff(
      document.body,
      newState,
      [nodes.b, nodes.d, nodes.e],
      identity
    );
    compare(newState, "bde");

    newState = domdiff(
      document.body,
      newState,
      [nodes.d, nodes.e, nodes.c],
      identity
    );
    compare(newState, "dec");

    newState = domdiff(
      document.body,
      newState,
      [nodes.j, nodes.a, nodes.b, nodes.c],
      identity
    );
    compare(newState, "jabc");

    newState = domdiff(
      document.body,
      newState,
      [nodes.d, nodes.a, nodes.b, nodes.c, nodes.j, nodes.e],
      identity
    );
    compare(newState, "dabcje");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e, nodes.f, nodes.g, nodes.h],
      identity
    );
    compare(newState, "abcdefgh");

    newState = domdiff(
      document.body,
      newState,
      [
        nodes.a,
        nodes.b,
        nodes.c,
        nodes.d,
        nodes.e,
        nodes.f,
        nodes.g,
        nodes.h
      ].reverse(),
      identity
    );
    compare(newState, "hgfedcba");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e, nodes.f],
      identity
    );
    compare(newState, "abcdef");

    newState = domdiff(
      document.body,
      newState,
      [nodes.e, nodes.d, nodes.c, nodes.b, nodes.f, nodes.a],
      identity
    );
    compare(newState, "edcbfa");

    // ## snabbdom - random values (unpinned)
    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e, nodes.f],
      identity
    );
    compare(newState, "abcdef");

    // /*
    newState = domdiff(
      document.body,
      newState,
      [
        null,
        nodes.c,
        undefined,
        null,
        nodes.b,
        nodes.a,
        null,
        nodes.f,
        nodes.e,
        null,
        nodes.d,
        undefined
      ].filter(notNull),
      identity
    );
    compare(newState.filter(notNull), "cbafed");

    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e, nodes.f],
      identity
    );
    compare(newState, "abcdef");

    // /*
    newState = domdiff(
      document.body,
      newState,
      [null, null, undefined, null, null, undefined].filter(notNull),
      identity
    );
    compare(newState.filter(notNull), "");

    console.time("average");
    newState = domdiff(
      document.body,
      newState,
      [nodes.a, nodes.b, nodes.c, nodes.d, nodes.e, nodes.f].reverse(),
      identity
    );
    compare(newState, "fedcba");
    console.timeEnd("average");

    newState = domdiff(document.body, newState, [nodes.a], identity);
    compare(newState, "a");

    newState = domdiff(
      document.body,
      newState,
      [nodes.b, nodes.c, nodes.d],
      identity
    );
    compare(newState, "bcd");

    newState = domdiff(document.body, newState, [nodes.a], identity);
    compare(newState, "a");

    newState = domdiff(document.body, newState, [], identity);

    var data = [
      { id: 4054, title: "Serie 2" },
      { id: 3982, title: "Serie 3" },
      { id: 4016, title: "Gracias" },
      { id: 3984, title: "Comparte" },
      { id: 3952, title: "Lección 1" },
      { id: 3955, title: "Lección 2" }
    ];

    var wm = {};

    var getItem = function (item) {
      return wm[item.id];
    };

    data.forEach(function (item) {
      wm[item.id] = document.createTextNode(item.id + ": " + item.title);
    });

    newState = domdiff(
      document.body,
      newState,
      data.slice().map(getItem),
      identity
    );

    newState = domdiff(
      document.body,
      newState,
      data
        .slice()
        .sort(function (a, b) {
          return a.title.localeCompare(b.title);
        })
        .map(getItem),
      identity
    );

    newState = domdiff(
      document.body,
      newState,
      Array(1000)
        .join(".")
        .split(".")
        .map(function (v, i) {
          return document.createTextNode("" + i);
        }),
      identity
    );

    console.time("random");
    newState = domdiff(
      document.body,
      newState,
      newState.slice().sort(function () {
        return Math.random() < 0.5 ? 1 : -1;
      }),
      identity
    );
    console.timeEnd("random");

    console.time("reversed");
    newState = domdiff(
      document.body,
      newState,
      newState.slice().reverse(),
      identity
    );
    console.timeEnd("reversed");

    document.body.selectedIndex = -1;
    newState = domdiff(document.body, newState, [], identity);

    var option = document.createTextNode("b");
    option.selected = true;
    newState = domdiff(
      document.body,
      newState,
      [document.createTextNode("a"), option, document.createTextNode("c")],
      identity
    );
    console.assert(document.body.selectedIndex === 1, "selectedIndex is OK");

    newState = domdiff(document.body, newState, [], identity);
    document.body.selectedIndex = 0;
    document.body.querySelectorAll = (_) => newState.concat(newOptions);
    option = document.createTextNode("option");
    option.selected = true;
    newState = domdiff(
      document.body,
      newState,
      [document.createTextNode("option")],
      identity
    );
    var newOptions = [
      document.createTextNode("option"),
      option,
      document.createTextNode("option")
    ];
    newState = domdiff(document.body, newState, newOptions, identity);
    console.assert(
      document.body.selectedIndex === 2,
      "partial selectedIndex is OK"
    );

    var parent1 = document.createDocumentFragment();
    var parent2 = document.createDocumentFragment();
    var nodeA = document.createTextNode("option");
    var nodeB = document.createTextNode("option");
    var nodeC = document.createTextNode("option");
    var nodeD = document.createTextNode("option");

    domdiff(parent1, [nodeA, nodeB], [nodeA, nodeB, nodeC], identity);

    domdiff(parent2, [nodeC, nodeD], [nodeD], identity);
  });
});
