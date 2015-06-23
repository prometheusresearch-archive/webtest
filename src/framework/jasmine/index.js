/**
 * @copyright 2015 Prometheus Research LLC
 */

import debug                from 'debug';
import fs                   from 'fs';
import path                 from 'path';
import express              from 'express';
import Webpack              from 'webpack';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import setupCompilerLogging from '../../setupCompilerLogging';

let log = debug('webtest:framework:jasmine');

export default function configure(options) {
  let bundleFilename = path.join(__dirname, 'bundle.js');
  if (!fs.existsSync(bundleFilename) || options.debug) {
    return configureDebug(options);
  } else {
    log('using pre-built framework bundle');
    return {serve: express.static(__dirname)};
  }
}

function configureDebug(options) {
  let bundleFilename = path.join(__dirname, 'bundle.js');
  let compiler = new Webpack(require('./webpack.config.js'));
  setupCompilerLogging(compiler, log);

  compiler.plugin('done', function() {
    fs.writeFile(bundleFilename, compiler.outputFileSystem.readFileSync('/bundle.js')); 
    fs.writeFile(bundleFilename + '.map', compiler.outputFileSystem.readFileSync('/bundle.js.map')); 
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
