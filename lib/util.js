/**
 * @copyright 2015 Prometheus Research LLC
 */

'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

exports.concatMapPromise = concatMapPromise;
exports.concat = concat;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function concatMapPromise(func, array) {
  var promises, resolutions;
  return _regeneratorRuntime.async(function concatMapPromise$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        promises = array.map(function (item) {
          return func(item);
        });
        context$1$0.next = 3;
        return _bluebird2['default'].all(promises);

      case 3:
        resolutions = context$1$0.sent;
        return context$1$0.abrupt('return', concat(resolutions));

      case 5:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function concat(arrays) {
  var result = [];
  for (var i = 0; i < arrays.length; i++) {
    result = result.concat(arrays[i]);
  }
  return result;
}
