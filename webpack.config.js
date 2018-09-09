const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './example/index.js',
  output: {
    path: `${__dirname}/example-live`,
    publicPath: '/',
    filename: 'webgl-scatterplot-example.js',
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
    }),
  ],
};
