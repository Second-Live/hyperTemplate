import { OWNER_SVG_ELEMENT } from "../shared/constants.js";

export const boolean = (node, key, oldValue) => (newValue) =>
  node.toggleAttribute(key, (oldValue = !!newValue));

export const attribute = (node, name) => {
  const isSVG = OWNER_SVG_ELEMENT in node;
  let oldValue;
  let orphan = true;
  const attributeNode = isSVG
    ? document.createAttributeNS("http://www.w3.org/2000/svg", name)
    : document.createAttribute(name);
  return (newValue) => {
    const value = newValue?.valueOf();
    if (oldValue !== value) {
      if ((oldValue = value) == null) {
        if (!orphan) {
          node.removeAttributeNode(attributeNode);
          orphan = true;
        }
      } else {
        attributeNode.value = value;
        if (orphan) {
          node.setAttributeNodeNS(attributeNode);
          orphan = false;
        }
      }
    }
  };
};
