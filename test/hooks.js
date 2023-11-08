import { JSDOM } from "jsdom";
import { expect } from "chai";

const window = new JSDOM(
  `<!doctype html>
  <html lang="en">
    <head><title>Hello</title></head>
    <body></body>
  </html>`,
  { url: "http://localhost/" }
).window;

export const mochaHooks = {
  async beforeAll() {
    globalThis.expect = expect;
    globalThis.window = window;
    globalThis.document = window.document;
    globalThis.customElements = window.customElements;
    globalThis.HTMLElement = window.HTMLElement;
    globalThis.CustomEvent = window.CustomEvent;
    globalThis.hyperHTML = await import("../src/index.js");
  }
};
