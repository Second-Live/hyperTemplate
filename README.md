# hyperTemplate

A **Fast & Light Virtual DOM Alternative**.

## Documentation

A proper documentation full of examples can be found in [viperhtml.js.org](https://viperhtml.js.org/).

## Basic Example

The easiest way to describe `hyperHTML` is through [an example](https://webreflection.github.io/hyperHTML/test/tick.html).

```js
// this is hyperHTML
function tick(render) {
  render`
    <div>
      <h1>Hello, world!</h1>
      <h2>It is ${new Date().toLocaleTimeString()}.</h2>
    </div>
  `;
}
setInterval(tick, 1000, hyperHTML(document.getElementById("root")));
```

## Features

- Zero dependencies, no polyfills needed, and it fits in about **4.6KB** (minified + brotli)
- Uses directly native DOM, no virtual DOM involved
- Designed for [template literals](http://www.ecma-international.org/ecma-262/6.0/#sec-template-literals), a templating feature built in to JS
- Compatible with plain DOM elements and plain JS data structures
- Also compatible with Babel transpiled output, hence suitable for every browser you can think of

## Compatibility

Last 2 versions of every browser, including mobile ones, are supported.
You can verify directly through the following links:

- [100% code coverage](https://webreflection.github.io/hyperHTML/test/)

## HTML Syntax Highlight

If you are using Visual Studio Code you can install `literally-html` to highlight all literals handled by `hyperHTML` and others.

![literally-html example](https://viperhtml.js.org/hyperhtml/documentation/img/literally-html.png)

## Prettier Templates

If you'd like to make your templates prettier than usual, don't miss this plugin: https://github.com/sgtpep/prettier-plugin-html-template-literals

#### installation?

```js
npm install hypertemplate
```

If your bundler does not work with the following:

```js
import hyperHTML from "hyperhtml";
```

You can try any of these other options.

```js
import hyperHTML from "hyperhtml/esm";
// or
import { hyper, wire, bind } from "hyperhtml/esm";
```
