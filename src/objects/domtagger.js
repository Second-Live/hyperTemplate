import {
  createContent,
  createTreeWalker,
  importNode
} from "../shared/utils.js";
import { instrument } from "./domsanitizer.js";

// the domtagger 🎉
export default domtagger;

// a RegExp that helps checking nodes that cannot contain comments
const textOnly = /^(?:textarea|script|style|title|plaintext|xmp)$/;
const parsed = new WeakMap();

// the prefix is used to identify either comments, attributes, or nodes
// that contain the related unique id. In the attribute cases
// isµX="attribute-name" will be used to map current X update to that
// attribute name, while comments will be like <!--isµX-->, to map
// the update to that specific comment node, hence its parent.
// style and textarea will have <!--isµX--> text content, and are handled
// directly through text-only updates.
const prefix = "isµ";

const reCreateScript = function (node) {
  console.warn("Script support will be removed in the next major version");
  // this used to be like that
  // const script = createElement(node, nodeName);
  // Browser execute script when it created through createElement.
  const script = document.createElement(node.nodeName);
  const attributes = node.attributes;
  const length = attributes.length;
  let i = 0;

  while (i < length) {
    script.setAttributeNode(attributes[i++].cloneNode(true));
  }

  script.textContent = node.textContent;
  node.parentNode.replaceChild(script, node);
};

function createInfo(options, template) {
  const svg = options.svg === "svg";
  const markup = instrument(template, prefix, svg);
  const content = createContent(markup, options.type);

  // once instrumented and reproduced as fragment, it's crawled
  // to find out where each update is in the fragment tree
  const tw = createTreeWalker(content, 1 | 128);
  const nodes = [];
  const length = template.length - 1;
  let i = 0;

  if (length === 0) {
    const node = tw.nextNode();
    /^script$/i.test(node?.nodeName) && reCreateScript(node);
  }
  // updates are searched via unique names, linearly increased across the tree
  // <div isµ0="attr" isµ1="other"><!--isµ2--><style><!--isµ3--</style></div>
  let search = `${prefix}${i}`;
  while (i < length) {
    const node = tw.nextNode();
    // if not all updates are bound but there's nothing else to crawl
    // it means that there is something wrong with the template.
    if (!node) throw `bad template: ${template}`;
    // if the current node is a comment, and it contains isµX
    // it means the update should take care of any content
    if (node.nodeType === 8) {
      // The only comments to be considered are those
      // which content is exactly the same as the searched one.
      if (node.data === search) {
        nodes.push({ type: "node", path: createPath(node) });
        search = `${prefix}${++i}`;
      }
    } else {
      // if the node is not a comment, loop through all its attributes
      // named isµX and relate attribute updates to this node and the
      // attribute name, retrieved through node.getAttribute("isµX")
      // the isµX attribute will be removed as irrelevant for the layout
      // let svg = -1;
      while (node.hasAttribute(search)) {
        nodes.push({
          type: "attr",
          path: createPath(node),
          name: node.getAttribute(search)
        });
        node.removeAttribute(search);
        search = `${prefix}${++i}`;
      }
      // if the node was a style, textarea, or others, check its content
      // and if it is <!--isµX--> then update tex-only this node
      if (
        textOnly.test(node.localName) &&
        node.textContent.trim() === `<!--${search}-->`
      ) {
        node.textContent = "";
        nodes.push({ type: "text", path: createPath(node) });
        search = `${prefix}${++i}`;
      }
    }
  }
  // once all nodes to update, or their attributes, are known, the content
  // will be cloned in the future to represent the template, and all updates
  // related to such content retrieved right away without needing to re-crawl
  // the exact same template, and its content, more than once.
  return { content, nodes };
}

// from a generic path, retrieves the exact targeted node
const reducePath = ({ childNodes }, i) => childNodes[i];

// from a fragment container, create an array of indexes
// related to its child nodes, so that it's possible
// to retrieve later on exact node via reducePath
const indexOf = [].indexOf;
const createPath = (node) => {
  const path = [];
  let { parentNode } = node;
  while (parentNode) {
    path.push(indexOf.call(parentNode.childNodes, node));
    node = parentNode;
    ({ parentNode } = node);
  }
  return path;
};

function createDetails(options, template) {
  parsed.has(template) || parsed.set(template, createInfo(options, template));
  const { content, nodes } = parsed.get(template);
  // clone deeply the fragment
  const fragment = importNode(content, true);
  // and relate an update handler per each node that needs one
  const updates = nodes.map(({ type, path, name }) => {
    const node = path.reduceRight(reducePath, fragment);
    return type === "node"
      ? options.any(node)
      : type === "attr"
      ? options.attribute(node, name)
      : options.text(node);
  });
  // return the fragment and all updates to use within its nodes
  return { content: fragment, updates };
}

function domtagger(options) {
  let previous = [];
  let updates = [];
  return function (template, ...values) {
    let details;
    if (previous !== template) {
      details = createDetails(options, (previous = template));
      updates = details.updates;
    }

    // even if the fragment and its nodes is not live yet,
    // it is already possible to update via interpolations values.
    updates.forEach((up, i) => up(values[i]));

    return details?.content || previous;
  };
}
