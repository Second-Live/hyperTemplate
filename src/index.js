import diff from "./objects/domdiff.js";
import Intent from "./objects/Intent.js";
import { observe, Tagger } from "./objects/Updates.js";
import wire, { content, weakly } from "./hyper/wire.js";
import render from "./hyper/render.js";

// all functions are self bound to the right context
// you can do the following
// const {bind, wire} = hyperHTML;
// and use them right away: bind(node)`hello!`;
const bind = (context) => render.bind(context);
const define = Intent.define;
const tagger = Tagger.prototype;
const Component = null;

hyper.bind = bind;
hyper.define = define;
hyper.diff = diff;
hyper.hyper = hyper;
hyper.observe = observe;
hyper.tagger = tagger;
hyper.wire = wire;

// everything is exported directly or through the
// hyperHTML callback, when used as top level script
export { bind, define, diff, hyper, observe, tagger, wire, Component };

// by default, hyperHTML is a smart function
// that "magically" understands what's the best
// thing to do with passed arguments
export default function hyper(HTML) {
  return arguments.length < 2
    ? HTML == null
      ? content("html")
      : typeof HTML === "string"
      ? hyper.wire(null, HTML)
      : "raw" in HTML
      ? content("html")(HTML)
      : "nodeType" in HTML
      ? hyper.bind(HTML)
      : weakly(HTML, "html")
    : ("raw" in HTML ? content("html") : hyper.wire).apply(null, arguments);
}
