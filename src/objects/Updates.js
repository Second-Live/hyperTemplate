import disconnected from "./disconnected.js";
import domdiff from "./domdiff.js";
import domtagger from "./domtagger.js";
import hyperStyle from "./hyperhtml-style.js";
import { wireType } from "../hyper/hyperhtml-wire.js";

import {
  CONNECTED,
  DISCONNECTED,
  DOCUMENT_FRAGMENT_NODE,
  OWNER_SVG_ELEMENT
} from "../shared/constants.js";

import { isArray, createContent } from "../shared/utils.js";
import Intent from "./Intent.js";

const observe = disconnected();

export { Tagger, observe };

// returns an intent to explicitly inject content as html
const asHTML = (html) => ({ html });

// returns nodes from wires
const asNode = (item, i) => {
  if (item.nodeType === wireType) {
    // in the Wire case, the content can be
    // removed, post-pended, inserted, or pre-pended and
    // all these cases are handled by domdiff already
    /* istanbul ignore next */
    return 1 / i < 0
      ? i
        ? item.remove()
        : item.lastChild
      : i
      ? item.valueOf()
      : item.firstChild;
  }
  return item;
};

// returns true if domdiff can handle the value
const canDiff = (value) => "ELEMENT_NODE" in value;

// borrowed from uhandlers
// https://github.com/WebReflection/uhandlers
const booleanSetter = (node, key, oldValue) => (newValue) => {
  if (oldValue !== !!newValue) {
    if ((oldValue = !!newValue)) node.setAttribute(key, "");
    else node.removeAttribute(key);
  }
};

const hyperSetter = (node, name, svg) =>
  svg
    ? (value) => {
        try {
          node[name] = value;
        } catch (nope) {
          node.setAttribute(name, value);
        }
      }
    : (value) => {
        node[name] = value;
      };

// when a Promise is used as interpolation value
// its result must be parsed once resolved.
// This callback is in charge of understanding what to do
// with a returned value once the promise is resolved.
const invokeAtDistance = (value, callback) => {
  callback(value.placeholder);
  if ("text" in value) {
    Promise.resolve(value.text).then(String).then(callback);
  } else if ("any" in value) {
    Promise.resolve(value.any).then(callback);
  } else if ("html" in value) {
    Promise.resolve(value.html).then(asHTML).then(callback);
  } else {
    Promise.resolve(Intent.invoke(value, callback)).then(callback);
  }
};

// quick and dirty way to check for Promise/ish values
const isPromise_ish = (value) => value != null && "then" in value;

// list of attributes that should not be directly assigned
const readOnly = /^(?:form|list)$/i;

// reused every slice time
const slice = [].slice;

// simplifies text node creation
const text = (node, text) => node.ownerDocument.createTextNode(text);

function Tagger(type) {
  this.type = type;
  return domtagger(this);
}

Tagger.prototype = {
  // there are four kind of attributes, and related behavior:
  //  * events, with a name starting with `on`, to add/remove event listeners
  //  * special, with a name present in their inherited prototype, accessed directly
  //  * regular, accessed through get/setAttribute standard DOM methods
  //  * style, the only regular attribute that also accepts an object as value
  //    so that you can style=${{width: 120}}. In this case, the behavior has been
  //    fully inspired by Preact library and its simplicity.
  attribute(node, name, original) {
    const isSVG = OWNER_SVG_ELEMENT in node;
    let oldValue;
    // if the attribute is the style one
    // handle it differently from others
    if (name === "style") return hyperStyle(node, original, isSVG);
    // direct accessors for <input .value=${...}> and friends
    else if (name.slice(0, 1) === ".")
      return hyperSetter(node, name.slice(1), isSVG);
    // boolean accessors for <input .value=${...}> and friends
    else if (name.slice(0, 1) === "?")
      return booleanSetter(node, name.slice(1));
    // the name is an event one,
    // add/remove event listeners accordingly
    else if (/^on/.test(name)) {
      let type = name.slice(2);
      if (type === CONNECTED || type === DISCONNECTED) {
        observe(node);
      } else if (name.toLowerCase() in node) {
        type = type.toLowerCase();
      }
      return (newValue) => {
        if (oldValue !== newValue) {
          if (oldValue) node.removeEventListener(type, oldValue, false);
          oldValue = newValue;
          if (newValue) node.addEventListener(type, newValue, false);
        }
      };
    }
    // the attribute is special ('value' in input)
    // and it's not SVG *or* the name is exactly data,
    // in this case assign the value directly
    else if (
      name === "data" ||
      (!isSVG && name in node && !readOnly.test(name))
    ) {
      return (newValue) => {
        if (oldValue !== newValue) {
          oldValue = newValue;
          if (node[name] !== newValue && newValue == null) {
            // cleanup on null to avoid silly IE/Edge bug
            node[name] = "";
            node.removeAttribute(name);
          } else node[name] = newValue;
        }
      };
    } else if (name in Intent.attributes) {
      oldValue;
      return (any) => {
        const newValue = Intent.attributes[name](node, any);
        if (oldValue !== newValue) {
          oldValue = newValue;
          if (newValue == null) node.removeAttribute(name);
          else node.setAttribute(name, newValue);
        }
      };
    }
    // in every other case, use the attribute node as it is
    // update only the value, set it as node only when/if needed
    else {
      let owner = false;
      const attribute = original.cloneNode(true);
      return (newValue) => {
        if (oldValue !== newValue) {
          oldValue = newValue;
          if (attribute.value !== newValue) {
            if (newValue == null) {
              if (owner) {
                owner = false;
                node.removeAttributeNode(attribute);
              }
              attribute.value = newValue;
            } else {
              attribute.value = newValue;
              if (!owner) {
                owner = true;
                node.setAttributeNode(attribute);
              }
            }
          }
        }
      };
    }
  },

  // in a hyper(node)`<div>${content}</div>` case
  // everything could happen:
  //  * it's a JS primitive, stored as text
  //  * it's null or undefined, the node should be cleaned
  //  * it's a component, update the content by rendering it
  //  * it's a promise, update the content once resolved
  //  * it's an explicit intent, perform the desired operation
  //  * it's an Array, resolve all values if Promises and/or
  //    update the node with the resulting list of content
  any(node, childNodes) {
    const nodeType =
      OWNER_SVG_ELEMENT in node ? /* istanbul ignore next */ "svg" : "html";
    let fastPath = false;
    let oldValue;
    const anyContent = (value) => {
      switch (typeof value) {
        case "string":
        case "number":
        case "boolean":
          if (fastPath) {
            if (oldValue !== value) {
              oldValue = value;
              childNodes[0].textContent = value;
            }
          } else {
            fastPath = true;
            oldValue = value;
            childNodes = domdiff(
              node.parentNode,
              childNodes,
              [text(node, value)],
              asNode,
              node
            );
          }
          break;
        case "function":
          anyContent(value(node));
          break;
        case "object":
        case "undefined":
          if (value == null) {
            fastPath = false;
            childNodes = domdiff(node.parentNode, childNodes, [], asNode, node);
            break;
          }
        default:
          fastPath = false;
          oldValue = value;
          if (isArray(value)) {
            if (value.length === 0) {
              if (childNodes.length) {
                childNodes = domdiff(
                  node.parentNode,
                  childNodes,
                  [],
                  asNode,
                  node
                );
              }
            } else {
              switch (typeof value[0]) {
                case "string":
                case "number":
                case "boolean":
                  anyContent({ html: value });
                  break;
                case "object":
                  if (isArray(value)) {
                    value = value.filter((v) => !!v);
                  }
                  if (isPromise_ish(value[0])) {
                    Promise.all(value).then(anyContent);
                    break;
                  }
                default:
                  childNodes = domdiff(
                    node.parentNode,
                    childNodes,
                    value,
                    asNode,
                    node
                  );
                  break;
              }
            }
          } else if (canDiff(value)) {
            childNodes = domdiff(
              node.parentNode,
              childNodes,
              value.nodeType === DOCUMENT_FRAGMENT_NODE
                ? slice.call(value.childNodes)
                : [value],
              asNode,
              node
            );
          } else if (isPromise_ish(value)) {
            value.then(anyContent);
          } else if ("placeholder" in value) {
            invokeAtDistance(value, anyContent);
          } else if ("text" in value) {
            anyContent(String(value.text));
          } else if ("any" in value) {
            anyContent(value.any);
          } else if ("html" in value) {
            childNodes = domdiff(
              node.parentNode,
              childNodes,
              slice.call(
                createContent([].concat(value.html).join(""), nodeType)
                  .childNodes
              ),
              asNode,
              node
            );
          } else if ("length" in value) {
            anyContent(slice.call(value));
          } else {
            anyContent(Intent.invoke(value, anyContent));
          }
          break;
      }
    };
    return anyContent;
  },

  // style or textareas don't accept HTML as content
  // it's pointless to transform or analyze anything
  // different from text there but it's worth checking
  // for possible defined intents.
  text(node) {
    let oldValue;
    const textContent = (value) => {
      if (oldValue !== value) {
        oldValue = value;
        const type = typeof value;
        if (type === "object" && value) {
          if (isPromise_ish(value)) {
            value.then(textContent);
          } else if ("placeholder" in value) {
            invokeAtDistance(value, textContent);
          } else if ("text" in value) {
            textContent(String(value.text));
          } else if ("any" in value) {
            textContent(value.any);
          } else if ("html" in value) {
            textContent([].concat(value.html).join(""));
          } else if ("length" in value) {
            textContent(slice.call(value).join(""));
          } else {
            textContent(Intent.invoke(value, textContent));
          }
        } else if (type === "function") {
          textContent(value(node));
        } else {
          node.textContent = value == null ? "" : value;
        }
      }
    };
    return textContent;
  }
};
