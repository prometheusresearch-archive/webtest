'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

exports.parseFrame = parseFrame;
exports.formatFrame = formatFrame;
exports['default'] = formatStackTrace;

var _stackMapper = require('stack-mapper');

var _stackMapper2 = _interopRequireDefault(_stackMapper);

var STACK_RE = /at ([^ ]+) \((.+):([0-9]+):([0-9]+)\)/;
var STACK_RE_NO_COLUMN = /at ([^ ]+) \((.+):([0-9]+)\)/;
var STACK_RE_NO_NAME = /at (.+):([0-9]+):([0-9]+)/;
var STACK_RE_NO_NAME_NO_COLUMN = /at (.+):([0-9]+)/;

function parseFrame(frame) {
  var m = STACK_RE.exec(frame);
  if (m) {
    frame = {
      name: m[1],
      filename: m[2],
      line: m[3],
      column: m[4] || 0
    };
    return frame;
  }
  m = STACK_RE_NO_NAME.exec(frame);
  if (m) {
    frame = {
      name: null,
      filename: m[1],
      line: m[2],
      column: m[3]
    };
    return frame;
  }
  m = STACK_RE_NO_NAME_NO_COLUMN.exec(frame);
  if (m) {
    frame = {
      name: null,
      filename: m[1],
      line: m[2],
      column: 0
    };
    return frame;
  }
  m = STACK_RE_NO_COLUMN.exec(frame);
  if (m) {
    frame = {
      name: null,
      filename: m[1],
      line: m[2],
      column: 0
    };
    return frame;
  }
  return null;
}

function formatFrame(frame) {
  if (frame.name) {
    return '    at ' + frame.name + ' (' + frame.filename + ':' + frame.line + ')';
  } else {
    return '    at ' + frame.filename + ':' + frame.line;
  }
}

function formatStackTrace(sourceMap, frames) {
  if (!Array.isArray(frames)) {
    frames = frames.split('\n').map(parseFrame).filter(Boolean);
  }
  var filtered = frames.filter(function (f) {
    return !/jasmine-core\/lib\/jasmine-core/.exec(f.filename);
  }).filter(function (f) {
    return !/webpack\/bootstrap/.exec(f.filename);
  }).filter(function (f) {
    return !/framework\/bundle.js/.exec(f.filename);
  });
  if (filtered.length > 0) {
    frames = filtered;
  }
  if (sourceMap) {
    frames = (0, _stackMapper2['default'])(sourceMap).map(frames);
  }
  frames = frames.map(function (f) {
    return _extends({}, f, { filename: f.filename.replace(/^webpack:\/\/\//, '') });
  }).filter(function (f) {
    return !/webpack\/bootstrap/.exec(f.filename);
  }).map(formatFrame);
  return frames.join('\n');
}
