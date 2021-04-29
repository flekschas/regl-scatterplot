const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => ({
  entry: {
    index: './example/index.js',
    embedded: './example/embedded.js',
    textureBackground: './example/texture-background.js',
    twoInstances: './example/two-instances.js',
    axes: './example/axes.js',
    transition: './example/transition.js',
    sizeEncoding: './example/size-encoding.js',
    connectedPoints: './example/connected-points.js',
    connectedPointsBySegment: './example/connected-points-by-segments.js',
    performanceMode: './example/performance-mode.js',
    dynamicOpacity: './example/dynamic-opacity.js',
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
    new HtmlWebpackPlugin({
      template: 'example/index.html',
      filename: 'axes.html',
      chunks: ['axes'],
    }),
    new HtmlWebpackPlugin({
      template: 'example/index.html',
      filename: 'transition.html',
      chunks: ['transition'],
    }),
    new HtmlWebpackPlugin({
      template: 'example/index.html',
      filename: 'size-encoding.html',
      chunks: ['sizeEncoding'],
    }),
    new HtmlWebpackPlugin({
      template: 'example/index.html',
      filename: 'connected-points.html',
      chunks: ['connectedPoints'],
    }),
    new HtmlWebpackPlugin({
      template: 'example/index.html',
      filename: 'connected-points-by-segment.html',
      chunks: ['connectedPointsBySegment'],
    }),
    new HtmlWebpackPlugin({
      template: 'example/index.html',
      filename: 'performance-mode.html',
      chunks: ['performanceMode'],
    }),
    new HtmlWebpackPlugin({
      template: 'example/index.html',
      filename: 'dynamic-opacity.html',
      chunks: ['dynamicOpacity'],
    }),
    new HtmlWebpackPlugin({
      template: 'example/index.html',
      filename: 'embedded.html',
      chunks: ['embedded'],
    }),
  ],
});
