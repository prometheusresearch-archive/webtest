/**
 * @copyright 2015 Prometheus Research LLC
 */

'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var SOURCE_MAP = undefined;

window.__webtest_sourceMap__ = SOURCE_MAP;

function fetchSourceMap() {
  if (SOURCE_MAP === undefined) {
    var request = new XMLHttpRequest();
    request.open('GET', '/bundle.js.map', false);
    request.send(null);

    if (request.status === 200) {
      SOURCE_MAP = JSON.parse(request.responseText);
    } else {
      SOURCE_MAP = null;
    }
  }
  return SOURCE_MAP;
}

var API = {
  fetchSourceMap: fetchSourceMap
};

window.__Webtest__ = API;

exports['default'] = API;
module.exports = exports['default'];
