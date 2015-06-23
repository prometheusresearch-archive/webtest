/**
 * @copyright 2015 Prometheus Research LLC
 */

'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = setupCompilerLogging;

function setupCompilerLogging(compiler, log) {
  compiler.plugin('done', function () {
    log('done');
  });
  compiler.plugin('compile', function () {
    log('compile');
  });
  compiler.plugin('invalid', function () {
    log('invalid');
  });
}

module.exports = exports['default'];
