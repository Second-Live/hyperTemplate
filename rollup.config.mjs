import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.js",
  plugins: [resolve({ modulesOnly: true })],
  context: "null",
  moduleContext: "null",
  output: [
    {
      exports: "named",
      esModule: false,
      file: "index.js",
      format: "iife",
      name: "hyperHTML"
    },
    {
      exports: "named",
      esModule: true,
      file: "esm.js",
      format: "esm",
      plugins: [terser()]
    },
    {
      exports: "named",
      esModule: false,
      file: "min.js",
      format: "iife",
      name: "hyperHTML",
      plugins: [terser()]
    }
  ]
};
