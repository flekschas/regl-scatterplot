const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => ({
  entry: {
    index: './example/index.js',
    textureBackground: './example/texture-background.js',
    twoInstances: './example/two-instances.js',
  },
  output: {
    path: `${__dirname}/docs`,
    publicPath: argv.mode === 'production' ? './' : '/',
  },
  devServer: {
    contentBase: './example',
  },
  module: {
    rules: [
      {
        test: /\.(js|fs|vs)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.fs', '.vs'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'example/index.html',
      filename: 'index.html',
      chunks: ['index'],
    }),
    new HtmlWebpackPlugin({
      template: 'example/index.html',
      filename: 'texture-background.html',
      chunks: ['textureBackground'],
    }),
    new HtmlWebpackPlugin({
      template: 'example/index.html',
      filename: 'two-instances.html',
      chunks: ['twoInstances'],
    }),
  ],
});
