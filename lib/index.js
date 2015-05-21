'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = webtest;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackDevServer = require('webpack-dev-server');

var _webpackDevServer2 = _interopRequireDefault(_webpackDevServer);

var _util = require('./util');

var _phantomjs = require('./phantomjs');

var _phantomjs2 = _interopRequireDefault(_phantomjs);

var _setupCompilerLogging = require('./setupCompilerLogging');

var _setupCompilerLogging2 = _interopRequireDefault(_setupCompilerLogging);

var _frameworkJasmine = require('./framework/jasmine');

var _frameworkJasmine2 = _interopRequireDefault(_frameworkJasmine);

var log = (0, _debug2['default'])('webtest:index');

var find = _bluebird2['default'].promisify(_glob2['default']);

var IGNORE_RE = /bower_components|node_modules/;

function webtest(context, entry, options) {
  var config = arguments[3] === undefined ? {} : arguments[3];

  return _bluebird2['default']['try'](function callee$1$0() {
    var compiler, server, framework;
    return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          log('context: %s', context);
          log('entry points: %s', entry);

          entry = entry.map(function (e) {
            return _path2['default'].resolve(context, e);
          });
          context$2$0.next = 5;
          return (0, _util.concatMapPromise)(find, entry);

        case 5:
          entry = context$2$0.sent;

          entry = entry.filter(function (e) {
            return !IGNORE_RE.exec(_path2['default'].relative(context, e));
          });

          log('entry points: %s', entry);

          if (!(entry.length === 0)) {
            context$2$0.next = 11;
            break;
          }

          console.warn('no tests cases were found');
          return context$2$0.abrupt('return');

        case 11:

          config = _extends({}, config, {
            context: context,
            entry: entry,
            devtool: 'source-map',
            output: {
              path: '/',
              filename: 'bundle.js'
            }
          });

          compiler = new _webpack2['default'](config);

          (0, _setupCompilerLogging2['default'])(compiler, (0, _debug2['default'])('webtest:compiler:test'));

          server = new _webpackDevServer2['default'](compiler, {
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
          framework = (0, _frameworkJasmine2['default'])(options);

          server.app.use('/framework', framework.serve);

          server.app.get('/', function (req, res, next) {
            res.send('\n        <!doctype html>\n        <html>\n          <head>\n            <meta charset="utf-8"/>\n          </head>\n          <body>\n            <script type="text/javascript" src="/framework/bundle.js"></script>\n            <script type="text/javascript" src="/bundle.js"></script>\n          </body>\n        </html>\n      ');
          });

          return context$2$0.abrupt('return', new _bluebird2['default'](function (resolve, reject) {
            server.listen(options.port, function () {
              log('server started on port: %s', options.port);
              var runtime = undefined;
              if (options.runtime === 'phantomjs') {
                runtime = new _phantomjs2['default'](options);
                if (options.watch) {
                  compiler.plugin('invalid', runtime.run);
                  if (framework.compiler) {
                    framework.compiler.plugin('invalid', runtime.run);
                  }
                }
              }
              var run = runtime.run();
              if (!options.watch) {
                return run.then(resolve, reject);
              }
            });
          }));

        case 19:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this);
  });
}

module.exports = exports['default'];
