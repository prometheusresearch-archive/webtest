'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = configure;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackDevMiddleware = require('webpack-dev-middleware');

var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

var _setupCompilerLogging = require('../../setupCompilerLogging');

var _setupCompilerLogging2 = _interopRequireDefault(_setupCompilerLogging);

var log = (0, _debug2['default'])('webtest:framework:jasmine');

function configure(options) {
  var bundleFilename = _path2['default'].join(__dirname, 'bundle.js');
  if (!_fs2['default'].existsSync(bundleFilename) || options.debug) {
    return configureDebug(options);
  } else {
    log('using pre-built framework bundle');
    return { serve: _express2['default']['static'](__dirname) };
  }
}

function configureDebug(options) {
  var bundleFilename = _path2['default'].join(__dirname, 'bundle.js');
  var compiler = new _webpack2['default'](require('./webpack.config.js'));
  (0, _setupCompilerLogging2['default'])(compiler, log);

  compiler.plugin('done', function () {
    _fs2['default'].writeFile(bundleFilename, compiler.outputFileSystem.readFileSync('/bundle.js'));
    _fs2['default'].writeFile(bundleFilename + '.map', compiler.outputFileSystem.readFileSync('/bundle.js.map'));
  });

  var serve = (0, _webpackDevMiddleware2['default'])(compiler, {
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

  return { serve: serve, compiler: compiler };
}
module.exports = exports['default'];
