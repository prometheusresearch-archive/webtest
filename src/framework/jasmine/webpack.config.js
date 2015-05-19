module.exports = {
  entry: require.resolve('./boot'),
  devtool: 'source-map',
  output: {
    path: '/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.js$/,
        loader: require.resolve('babel-loader') + '?stage=0'
      }
    ]
  },
  node: {
    global: true
  }
};
