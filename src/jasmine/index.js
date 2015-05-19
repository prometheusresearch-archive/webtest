import Webpack              from 'webpack';
import WebpackDevMiddleware from 'webpack-dev-middleware';

export default function configure(options) {
  let compiler = new Webpack({
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
  });

  let serve = WebpackDevMiddleware(compiler, {
    contentBase: false,
    inline: true,
    noInfo: true,
    stats: {
      assets: false,
      colors: false,
      version: false,
      hash: false,
      timings: false,
      chunks: false,
      chunkModules: false
    }
  });

  return {serve, compiler};
}
