// Node.CONSTANTS
// 'cause some engine has no global Node defined
// (i.e. Node, NativeScript, basicHTML ... )
export const ELEMENT_NODE = 1;
export const DOCUMENT_FRAGMENT_NODE = 11;
export const COMMENT_NODE = 8;
export const TEXT_NODE = 3;

export const UID = "-" + Math.random() + "%";
export const UIDC = "<!--" + UID + "-->";

export const SHOULD_USE_TEXT_CONTENT =
  /^(?:plaintext|script|style|textarea|title|xmp)$/i;
export const VOID_ELEMENTS =
  /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i;

// SVG related constants
export const OWNER_SVG_ELEMENT = "ownerSVGElement";

// Custom Elements / MutationObserver constants
export const CONNECTED = "connected";
export const DISCONNECTED = "dis" + CONNECTED;
