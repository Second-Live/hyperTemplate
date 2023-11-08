import {
  UID,
  UIDC,
  COMMENT_NODE,
  ELEMENT_NODE,
  SHOULD_USE_TEXT_CONTENT,
  TEXT_NODE
} from "../shared/constants.js";

const trim = "".trim;

export function find(node, path) {
  return path.reduce((node, index) => node.childNodes[index], node);
}

export function parse(node, holes, parts, path) {
  var childNodes = node.childNodes;
  var length = childNodes.length;
  var i = 0;
  while (i < length) {
    var child = childNodes[i];
    switch (child.nodeType) {
      case ELEMENT_NODE:
        var childPath = path.concat(i);
        parseAttributes(child, holes, parts, childPath);
        parse(child, holes, parts, childPath);
        break;
      case COMMENT_NODE:
        var textContent = child.textContent;
        if (textContent === UID) {
          parts.shift();
          holes.push(
            // basicHTML or other non standard engines
            // might end up having comments in nodes
            // where they shouldn't, hence this check.
            SHOULD_USE_TEXT_CONTENT.test(node.nodeName)
              ? Text(node, path)
              : Any(child, path.concat(i))
          );
        } else {
          switch (textContent.slice(0, 2)) {
            case "/*":
              if (textContent.slice(-2) !== "*/") break;
            case "\uD83D\uDC7B": // ghost
              node.removeChild(child);
              i--;
              length--;
          }
        }
        break;
      case TEXT_NODE:
        // the following ignore is actually covered by browsers
        // only basicHTML ends up on previous COMMENT_NODE case
        // instead of TEXT_NODE because it knows nothing about
        // special style or textarea behavior
        /* istanbul ignore if */
        if (
          SHOULD_USE_TEXT_CONTENT.test(node.nodeName) &&
          trim.call(child.textContent) === UIDC
        ) {
          parts.shift();
          holes.push(Text(node, path));
        }
        break;
    }
    i++;
  }
}

function parseAttributes(node, holes, parts, path) {
  const attributes = node.attributes;
  const remove = [];
  const array = [...attributes];
  var length = array.length;
  var i = 0;
  while (i < length) {
    var attribute = array[i++];
    var direct = attribute.value === UID;
    var sparse;
    if (direct || 1 < (sparse = attribute.value.split(UIDC)).length) {
      var name = attribute.name;
      var realName = parts
        .shift()
        .replace(
          direct
            ? /^(?:|[\S\s]*?\s)(\S+?)\s*=\s*('|")?$/
            : new RegExp(
                "^(?:|[\\S\\s]*?\\s)(" + name + ")\\s*=\\s*('|\")[\\S\\s]*",
                "i"
              ),
          "$1"
        );
      var value =
        attributes[realName] ||
        // the following ignore is covered by browsers
        // while basicHTML is already case-sensitive
        /* istanbul ignore next */
        attributes[realName.toLowerCase()];
      if (direct) holes.push(Attr(value, path, realName, null));
      else {
        var skip = sparse.length - 2;
        while (skip--) parts.shift();
        holes.push(Attr(value, path, realName, sparse));
      }
      remove.push(attribute);
    }
  }

  remove.forEach((attr) => node.removeAttributeNode(attr));
}

function Any(node, path) {
  return {
    type: "any",
    node: node,
    path: path
  };
}

function Attr(node, path, name, sparse) {
  return {
    type: "attr",
    node: node,
    path: path,
    name: name,
    sparse: sparse
  };
}

function Text(node, path) {
  return {
    type: "text",
    node: node,
    path: path
  };
}
