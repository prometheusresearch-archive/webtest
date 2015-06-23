/**
 * @copyright 2015 Prometheus Research LLC
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

require('jasmine-core/lib/jasmine-core/jasmine.css');

var _jasmineCoreLibJasmineCoreJasmine = require('jasmine-core/lib/jasmine-core/jasmine');

var _jasmineCoreLibJasmineCoreJasmine2 = _interopRequireDefault(_jasmineCoreLibJasmineCoreJasmine);

require('imports?jasmineRequire=jasmine-core/lib/jasmine-core/jasmine!jasmine-core/lib/jasmine-core/jasmine-html');

var _API = require('../API');

var _API2 = _interopRequireDefault(_API);

var _TapReporter = require('./TapReporter');

var _TapReporter2 = _interopRequireDefault(_TapReporter);

var _formatStackTrace = require('../../formatStackTrace');

var _formatStackTrace2 = _interopRequireDefault(_formatStackTrace);

var __ExceptionFormatter = _jasmineCoreLibJasmineCoreJasmine2['default'].ExceptionFormatter();
_jasmineCoreLibJasmineCoreJasmine2['default'].ExceptionFormatter = function () {
  return function () {
    var underlying = new __ExceptionFormatter();
    this.message = underlying.message;
    this.stack = function (err) {
      var sourceMap = _API2['default'].fetchSourceMap();
      if (!err || !err.stack || !sourceMap) {
        return underlying.stack(err);
      } else {
        return (0, _formatStackTrace2['default'])(sourceMap, err.stack);
      }
    };
  };
};

window.jasmine = _jasmineCoreLibJasmineCoreJasmine2['default'].core(_jasmineCoreLibJasmineCoreJasmine2['default']);

_jasmineCoreLibJasmineCoreJasmine2['default'].html(jasmine);

var env = jasmine.getEnv();

var jasmineInterface = _jasmineCoreLibJasmineCoreJasmine2['default']['interface'](jasmine, env);

extend(window, jasmineInterface);

var queryString = new jasmine.QueryString({
  getWindowLocation: function getWindowLocation() {
    return window.location;
  }
});

var catchingExceptions = queryString.getParam('catch');
env.catchExceptions(typeof catchingExceptions === 'undefined' ? true : catchingExceptions);

var throwingExpectationFailures = queryString.getParam('throwFailures');
env.throwOnExpectationFailure(throwingExpectationFailures);

var htmlReporter = new jasmine.HtmlReporter({
  env: env,
  onRaiseExceptionsClick: function onRaiseExceptionsClick() {
    queryString.navigateWithNewParam('catch', !env.catchingExceptions());
  },
  onThrowExpectationsClick: function onThrowExpectationsClick() {
    queryString.navigateWithNewParam('throwFailures', !env.throwingExpectationFailures());
  },
  addToExistingQueryString: function addToExistingQueryString(key, value) {
    return queryString.fullStringWithNewParam(key, value);
  },
  getContainer: function getContainer() {
    return document.body;
  },
  createElement: function createElement() {
    return document.createElement.apply(document, arguments);
  },
  createTextNode: function createTextNode() {
    return document.createTextNode.apply(document, arguments);
  },
  timer: new jasmine.Timer()
});

var tapReporter = new _TapReporter2['default']();

env.addReporter(jasmineInterface.jsApiReporter);
env.addReporter(htmlReporter);
env.addReporter(tapReporter);

var specFilter = new jasmine.HtmlSpecFilter({
  filterString: function filterString() {
    return queryString.getParam('spec');
  }
});

env.specFilter = function (spec) {
  return specFilter.matches(spec.getFullName());
};

window.setTimeout = window.setTimeout;
window.setInterval = window.setInterval;
window.clearTimeout = window.clearTimeout;
window.clearInterval = window.clearInterval;

var currentWindowOnload = window.onload;

window.onload = function () {
  if (currentWindowOnload) {
    currentWindowOnload();
  }
  htmlReporter.initialize();
  env.execute();
};

function extend(destination, source) {
  for (var property in source) {
    destination[property] = source[property];
  }return destination;
}
