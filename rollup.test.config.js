import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import json from "rollup-plugin-json";

export default {
  input: "./tests/index.js",
  output: [
    {
      name: "test",
      format: "iife",
      sourcemap: "inline"
    }
  ],
  plugins: [resolve(), commonjs(), json()]
};
