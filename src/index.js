import fs   from 'fs';
import path from 'path';

import debug                from 'debug';
import glob                 from 'glob';
import Promise              from 'bluebird';
import express              from 'express';
import Webpack              from 'webpack';
import WebpackDevServer     from 'webpack-dev-server';

import {concatMapPromise}   from './util';
import PhantomRunner        from './phantomjs';
import configureFramework   from './jasmine';

let log = debug('webtest:index');

let find = Promise.promisify(glob);

function setupCompilerLogging(compiler, log) {
  compiler.plugin('done', function() {
    log('done');
  });
  compiler.plugin('compile', function() {
    log('compile');
  });
  compiler.plugin('invalid', function() {
    log('invalid');
  });
}

export default async function webtest(context, entry, options, config = {}) {
  log('context: %s', context);
  log('entry points: %s', entry);

  entry = entry.map(e => `${context}/${e}`);
  entry = await concatMapPromise(find, entry);

  if (entry.length === 0) {
    console.warn('no tests cases were found');
    return;
  }

  config = {
    ...config,
    context,
    entry,
    devtool: 'source-map',
    output: {
      path: '/',
      filename: 'bundle.js'
    }
  };

  let testCompiler = new Webpack(config);
  setupCompilerLogging(testCompiler, debug('webtest:compiler:test'));

  let server = new WebpackDevServer(testCompiler, {
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

  let framework = configureFramework(options);

  server.app.use('/framework', framework.serve);

  server.app.get('/', function(req, res, next) {
    res.send(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8"/>
        </head>
        <body>
          <script type="text/javascript" src="/framework/bundle.js"></script>
          <script type="text/javascript" src="/bundle.js"></script>
        </body>
      </html>
    `);
  });

  return new Promise((resolve, reject) => {
    server.listen(options.port, function() {
      log('server started on port: %s', options.port);
      let context = {
        options,
        testCompiler,
        framework
      };
      let runtime;
      if (options.runtime === 'phantomjs') {
        runtime = new PhantomRunner(context);
      }
      let run = runtime.run();
      if (!options.watch) {
        return run
          .then(
            resolve,
            reject);
      }
    });
  });

}
