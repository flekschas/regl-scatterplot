import { terser } from "rollup-plugin-terser";
import buble from "rollup-plugin-buble";

const config = (file, format, plugins) => ({
  input: "src/index.js",
  output: {
    name: "createScatterplot",
    format,
    file,
    globals: {
      "pub-sub-es": "createPubSub",
      regl: "createREGL"
    }
  },
  plugins,
  external: ["pub-sub-es", "regl"]
});

export default [
  config("dist/regl-scatterplot.js", "umd", [buble()]),
  config("dist/regl-scatterplot.min.js", "umd", [buble(), terser()])
];
