const { isArray } = Array;

export { isArray };

export const {
  createDocumentFragment,
  createElement,
  createElementNS,
  createRange,
  createTreeWalker,
  importNode
} = new Proxy(
  {},
  {
    get: (_, method) => document[method].bind(document)
  }
);

const createHTML = (html) => {
  const template = createElement("template");
  template.innerHTML = html;
  return template.content;
};

let xml;
let range;
const createSVG = (svg) => {
  if (!xml) {
    xml = createElementNS("http://www.w3.org/2000/svg", "svg");
    range = createRange();
    range.selectNodeContents(xml);
  }
  return range.createContextualFragment(svg);
};

export const createContent = (text, type) =>
  type == "svg" ? createSVG(text) : createHTML(text);
