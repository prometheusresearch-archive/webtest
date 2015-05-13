import fs from 'fs';
import path from 'path';
import glob from 'glob';
import Promise from 'bluebird';
import express from 'express';
import Webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import Phantom from 'phantom';

let find = Promise.promisify(glob);

async function concatMapPromise(func, array) {
  let promises = array.map(item => func(item));
  let resolutions = await Promise.all(promises);
  return concat(resolutions);
}

function concat(arrays) {
  var result = [];
  for (var i = 0; i < arrays.length; i++) {
    result = result.concat(arrays[i]);
  }
  return result;
}


function runPhantom() {
  return new Promise(resolve => Phantom.create(phantom => resolve(phantom)));
}

function servePackage(app, packageName) {
  let packageDir = path.dirname(require.resolve(`${packageName}/package.json`));
  app.use(`/${packageName}`, express.static(packageDir));
}

export async function start(directory, options, config = {}, webpackConfig = {}) {
  let entry = config.entry ?
    config.entry :
    directory + '/**/__tests__/*-test.js';
  if (!Array.isArray(entry)) {
    entry = [entry];
  }
  entry = await concatMapPromise(find, entry);

  if (entry.length === 0) {
    return;
  }

  webpackConfig = {
    ...webpackConfig,
    entry,
    devtool: 'source-map',
    output: {
      path: '/',
      filename: 'bundle.js'
    }
  };

  let testCompiler = new Webpack(webpackConfig);
  let server = new WebpackDevServer(testCompiler, {
    contentBase: false,
    inline: true,
    quiet: true,
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

  let frameworkCompiler = new Webpack({
    entry: require.resolve('./framework'),
    devtool: 'source-map',
    output: {
      path: '/',
      filename: 'bundle.js'
    },
    module: {
      loaders: [
        {test: /\.js$/, loader: 'babel?stage=0'}
      ]
    }
  });
  let middleware = WebpackDevMiddleware(frameworkCompiler, {
    contentBase: false,
    inline: true,
    quiet: true,
    stats: {
      assets: false,
      colors: false,
      version: false,
      hash: false,
      timings: false,
      chunks: false,
      chunkModules: false
    }
  })

  server.app.use('/framework', middleware);

  servePackage(server.app, 'jasmine-core');
  server.app.get('/', function(req, res, next) {
    res.send(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <link rel="stylesheet" type="text/css" href="/jasmine-core/lib/jasmine-core/jasmine.css">
        </head>
        <body>
          <script type="text/javascript" src="/jasmine-core/lib/jasmine-core/jasmine.js"></script>
          <script type="text/javascript" src="/jasmine-core/lib/jasmine-core/jasmine-html.js"></script>
          <script type="text/javascript" src="/framework/bundle.js"></script>
          <script type="text/javascript" src="/bundle.js"></script>
        </body>
      </html>
    `);
  });

  let phantom = runPhantom();

  function phantomPass() {
    serverStarted.then(() =>
      phantom.then(phantom => new Promise(resolve => {
        phantom.createPage(page => {
          page.onConsoleMessage(msg => console.log(msg));
          page.open(`http://0.0.0.0:${options.port}`, status => page.close());
          resolve();
        })
      })));
  }

  let serverStarted = new Promise(resolve => {
    server.listen(options.port, function() {
      resolve();
    });
  });

  testCompiler.plugin('invalid', phantomPass);
  frameworkCompiler.plugin('invalid', phantomPass);

  phantomPass();
}
