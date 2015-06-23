/**
 * @copyright 2015 Prometheus Research LLC
 */

'use strict';

var _createDecoratedClass = require('babel-runtime/helpers/create-decorated-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _phantom2 = require('phantom');

var _phantom3 = _interopRequireDefault(_phantom2);

var _autobindDecorator = require('autobind-decorator');

var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

var _tapParser = require('tap-parser');

var _tapParser2 = _interopRequireDefault(_tapParser);

var _formatStackTrace = require('./formatStackTrace');

var _formatStackTrace2 = _interopRequireDefault(_formatStackTrace);

var log = (0, _debug2['default'])('webtest:phantomjs');

var _phantom = undefined;

function runPhantom() {
  if (!_phantom) {
    _phantom = new _bluebird2['default'](function (resolve) {
      return _phantom3['default'].create(function (phantom) {
        return resolve(phantom);
      });
    });
  }
  return _phantom;
}

var PhantomRunner = (function () {
  function PhantomRunner(options) {
    _classCallCheck(this, PhantomRunner);

    this.href = 'http://0.0.0.0:' + options.port;
  }

  _createDecoratedClass(PhantomRunner, [{
    key: 'run',
    decorators: [_autobindDecorator2['default']],
    value: function run() {
      var _this = this;

      return runPhantom().then(function (phantom) {
        return new _bluebird2['default'](function (resolve) {
          log('start running tests');
          var result = null;
          var parser = new _tapParser2['default'](function (_result) {
            result = _result;
          });
          phantom.createPage(function (page) {
            page.onConsoleMessage(function (msg) {
              console.log(msg);
              parser.write(msg + '\n', 'utf8');
            });
            page.onError(function (err, frames) {
              page.evaluate(function () {
                return window.__Webtest__.fetchSourceMap();
              }, function (sourceMap) {
                frames = frames.map(function (f) {
                  return { filename: f.file, line: f.line, column: 0 };
                });
                var stack = (0, _formatStackTrace2['default'])(sourceMap, frames);
                console.log(err + '\n' + stack);
              });
            });
            page.open(_this.href, function (status) {
              log('end running tests');
              parser.end();
              page.close();
              resolve(result);
            });
          });
        });
      });
    }
  }]);

  return PhantomRunner;
})();

exports['default'] = PhantomRunner;
module.exports = exports['default'];
