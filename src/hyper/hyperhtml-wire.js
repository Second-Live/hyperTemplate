import { createDocumentFragment, createRange } from "../shared/utils.js";

export const wireType = 111;

export class Wire {
  ELEMENT_NODE = 1;
  nodeType = wireType;

  constructor(childNodes) {
    this.childNodes = [...childNodes];
  }

  get firstChild() {
    return this.childNodes[0];
  }

  get lastChild() {
    return this.childNodes[this.childNodes.length - 1];
  }

  remove() {
    const range = createRange();
    range.setStartAfter(this.firstChild);
    range.setEndAfter(this.lastChild);
    range.deleteContents();
    return this.firstChild;
  }

  valueOf() {
    const fragment = createDocumentFragment();
    fragment.append(...this.childNodes);
    return fragment;
  }
}
