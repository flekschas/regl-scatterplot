const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => ({
  entry: "./example/index.js",
  output: {
    path: `${__dirname}/docs`,
    publicPath: argv.mode === "production" ? "./" : "/",
    filename: "example.js"
  },
  devServer: {
    contentBase: "./example"
  },
  module: {
    rules: [
      {
        test: /\.(js|fs|vs)$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      }
    ]
  },
  resolve: {
    extensions: ["*", ".js", ".fs", ".vs"]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "example/index.html"
    })
  ]
});
