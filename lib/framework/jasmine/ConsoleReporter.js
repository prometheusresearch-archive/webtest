'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var noopTimer = {
  start: function start() {},
  elapsed: function elapsed() {
    return 0;
  }
};

function ConsoleReporter(options) {
  var print = options.print,
      showColors = options.showColors || false,
      onComplete = options.onComplete || function () {},
      timer = options.timer || noopTimer,
      specCount = undefined,
      failureCount = undefined,
      specs = [],
      failedSpecs = [],
      pendingCount = undefined,
      ansi = {
    green: '\u001b[32m',
    red: '\u001b[31m',
    yellow: '\u001b[33m',
    none: '\u001b[0m'
  },
      failedSuites = [];

  this.jasmineStarted = function () {
    specCount = 0;
    failureCount = 0;
    pendingCount = 0;
    print('Started');
    timer.start();
  };

  this.jasmineDone = function () {

    var dots = [];

    for (var _i = 0; _i < specs.length; _i++) {
      var result = specs[_i];
      if (result.status == 'pending') {
        dot.push(colored('yellow', '*'));
      } else if (result.status == 'passed') {
        dots.push(colored('green', '.'));
      } else if (result.status == 'failed') {
        dots.push(colored('red', 'F'));
      }
    }

    print(dots.join(''));

    for (var _i2 = 0; _i2 < failedSpecs.length; _i2++) {
      specFailureDetails(failedSpecs[_i2]);
    }

    if (specCount > 0) {

      var specCounts = specCount + ' ' + plural('spec', specCount) + ', ' + failureCount + ' ' + plural('failure', failureCount);

      if (pendingCount) {
        specCounts += ', ' + pendingCount + ' pending ' + plural('spec', pendingCount);
      }

      print(specCounts);
    } else {
      print('No specs found');
    }

    var seconds = timer.elapsed() / 1000;
    print('Finished in ' + seconds + ' ' + plural('second', seconds));

    for (i = 0; i < failedSuites.length; i++) {
      suiteFailureDetails(failedSuites[i]);
    }

    onComplete(failureCount === 0);
  };

  this.specDone = function (result) {
    specs.push(result);
    if (result.status !== 'disabled') {
      specCount++;
    }
    if (result.status == 'pending') {
      pendingCount++;
    } else if (result.status == 'passed') {} else if (result.status == 'failed') {
      failureCount++;
      failedSpecs.push(result);
    }
  };

  this.suiteDone = function (result) {
    if (result.failedExpectations && result.failedExpectations.length > 0) {
      failureCount++;
      failedSuites.push(result);
    }
  };

  return this;

  function printNewline() {
    print('');
  }

  function colored(color, str) {
    return showColors ? ansi[color] + str + ansi.none : str;
  }

  function plural(str, count) {
    return count == 1 ? str : str + 's';
  }

  function repeat(thing, times) {
    var arr = [];
    for (var _i3 = 0; _i3 < times; _i3++) {
      arr.push(thing);
    }
    return arr;
  }

  function indent(str, spaces) {
    var lines = (str || '').split('\n');
    var newArr = [];
    for (var _i4 = 0; _i4 < lines.length; _i4++) {
      newArr.push(repeat(' ', spaces).join('') + lines[_i4]);
    }
    return newArr.join('\n');
  }

  function specFailureDetails(result) {
    print(result.fullName);

    for (var _i5 = 0; _i5 < result.failedExpectations.length; _i5++) {
      var failedExpectation = result.failedExpectations[_i5];
      print(indent(failedExpectation.message, 2));
      print(indent(failedExpectation.stack, 2));
    }

    printNewline();
  }

  function suiteFailureDetails(result) {
    for (var _i6 = 0; _i6 < result.failedExpectations.length; _i6++) {
      printNewline();
      print(colored('red', 'An error was thrown in an afterAll'));
      printNewline();
      print(colored('red', 'AfterAll ' + result.failedExpectations[_i6].message));
    }
    printNewline();
  }
}

exports['default'] = ConsoleReporter;
module.exports = exports['default'];
