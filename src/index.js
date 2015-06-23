/**
 * @copyright 2015 Prometheus Research LLC
 */

import fs   from 'fs';
import path from 'path';

import debug                from 'debug';
import glob                 from 'glob';
import Promise              from 'bluebird';
import express              from 'express';
import Webpack              from 'webpack';
import WebpackDevServer     from 'webpack-dev-server';

import concatMapPromise     from './concatMapPromise';
import PhantomRunner        from './phantomjs';
import setupCompilerLogging from './setupCompilerLogging';
import configureFramework   from './framework/jasmine';

let log = debug('webtest:index');

let find = Promise.promisify(glob);

const IGNORE_RE = /bower_components|node_modules/;

export default function webtest(context, entry, options, config = {}) {
  return Promise.try(async function() {
    log('context: %s', context);
    log('entry points: %s', entry);

    entry = entry.map(e => path.resolve(context, e));
    entry = await concatMapPromise(find, entry);
    entry = entry.filter(e => !IGNORE_RE.exec(path.relative(context, e)));

    log('entry points: %s', entry);
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

    let compiler = new Webpack(config);
    setupCompilerLogging(compiler, debug('webtest:compiler:test'));

    let server = new WebpackDevServer(compiler, {
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
        let runtime;
        if (options.runtime === 'phantomjs') {
          runtime = new PhantomRunner(options);
          if (options.watch) {
            compiler.plugin('invalid', runtime.run);
            if (framework.compiler) {
              framework.compiler.plugin('invalid', runtime.run);
            }
          }
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
  });
}
