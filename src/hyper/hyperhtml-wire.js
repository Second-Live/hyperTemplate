export const wireType = 111;

export class Wire {
  ELEMENT_NODE = 1;
  nodeType = wireType;
  _ = null;

  constructor(childNodes) {
    this.parentNode = childNodes[0].parentNode;
    this.childNodes = [...childNodes];
  }

  get firstChild() {
    return this.childNodes[0];
  }

  get lastChild() {
    return this.childNodes[this.childNodes.length - 1];
  }

  get ownerDocument() {
    return this.firstChild.ownerDocument;
  }

  remove() {
    this._ = null;
    this.parentNode.replaceChildren();
  }

  valueOf() {
    let fragment = this._;
    if (fragment === null) {
      fragment = this._ = this.ownerDocument.createDocumentFragment();
    }
    fragment.replaceChildren(...this.childNodes);
    return fragment;
  }
}
