import createStackMapper from 'stack-mapper';

const STACK_RE = /at ([^ ]+) \((.+):([0-9]+):([0-9]+)\)/;
const STACK_RE_NO_NAME = /at (.+):([0-9]+):([0-9]+)/;
const SOURCE_MAP = fetchSourceMap();

function parseStackLine(line) {
  let m = STACK_RE.exec(line)
  if (m) {
    return {
      name: m[1],
      filename: m[2],
      line: m[3],
      column: m[4]
    };
  }
  m = STACK_RE_NO_NAME.exec(line)
  if (m) {
    return {
      name: null,
      filename: m[1],
      line: m[2],
      column: m[3]
    };
  }
  return null;
}

function fetchSourceMap() {
  let request = new XMLHttpRequest();
  request.open('GET', '/bundle.js.map', false);
  request.send(null);

  if (request.status === 200) {
    return JSON.parse(request.responseText);
  } else {
    return null;
  }
}

let stackMapper = createStackMapper(SOURCE_MAP);

let __ExceptionFormatter = jasmineRequire.ExceptionFormatter();
jasmineRequire.ExceptionFormatter = function() {
  return function() {
    let underlying = new __ExceptionFormatter();
    this.message = underlying.message;
    this.stack = function(err) {
      if (!err || !err.stack || !SOURCE_MAP) {
        return underlying.stack(err);
      }
      let lines = err.stack.split('\n');
      lines = lines
        .map(parseStackLine)
        .filter(Boolean)
        .filter(line => !/jasmine-core\/lib\/jasmine-core/.exec(line.filename))
        .filter(line => !/framwork\/bundle.js/.exec(line.filename));
      lines = stackMapper.map(lines)
        .map(line => ({...line, filename: line.filename.replace(/^webpack:\/\/\//, '')}))
        .map(line => `    at ${line.name} (${line.filename}:${line.line}:${line.column})`)
      return lines.join('\n');
    };
  };
};

var noopTimer = {
  start: function(){},
  elapsed: function(){ return 0; }
};

function ConsoleReporter(options) {
  var print = options.print,
    showColors = options.showColors || false,
    onComplete = options.onComplete || function() {},
    timer = options.timer || noopTimer,
    specCount,
    failureCount,
    specs = [],
    failedSpecs = [],
    pendingCount,
    ansi = {
      green: '\x1B[32m',
      red: '\x1B[31m',
      yellow: '\x1B[33m',
      none: '\x1B[0m'
    },
    failedSuites = [];

  this.jasmineStarted = function() {
    specCount = 0;
    failureCount = 0;
    pendingCount = 0;
    print('Started');
    timer.start();
  };

  this.jasmineDone = function() {

    var dots = [];

    for (var i = 0; i < specs.length; i++) {
      var result = specs[i];
      if (result.status == 'pending') {
        dot.push(colored('yellow', '*'));
      } else if (result.status == 'passed') {
        dots.push(colored('green', '.'));
      } else if (result.status == 'failed') {
        dots.push(colored('red', 'F'));
      }
    }

    print(dots.join(''));

    for (var i = 0; i < failedSpecs.length; i++) {
      specFailureDetails(failedSpecs[i]);
    }

    if(specCount > 0) {

      var specCounts = specCount + ' ' + plural('spec', specCount) + ', ' +
        failureCount + ' ' + plural('failure', failureCount);

      if (pendingCount) {
        specCounts += ', ' + pendingCount + ' pending ' + plural('spec', pendingCount);
      }

      print(specCounts);
    } else {
      print('No specs found');
    }

    var seconds = timer.elapsed() / 1000;
    print('Finished in ' + seconds + ' ' + plural('second', seconds));

    for(i = 0; i < failedSuites.length; i++) {
      suiteFailureDetails(failedSuites[i]);
    }

    onComplete(failureCount === 0);
  };

  this.specDone = function(result) {
    specs.push(result);
    specCount++;
    if (result.status == 'pending') {
      pendingCount++;
    } else if (result.status == 'passed') {
      
    } else if (result.status == 'failed') {
      failureCount++;
      failedSpecs.push(result);
    }
  };

  this.suiteDone = function(result) {
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
    return showColors ? (ansi[color] + str + ansi.none) : str;
  }

  function plural(str, count) {
    return count == 1 ? str : str + 's';
  }

  function repeat(thing, times) {
    var arr = [];
    for (var i = 0; i < times; i++) {
      arr.push(thing);
    }
    return arr;
  }

  function indent(str, spaces) {
    var lines = (str || '').split('\n');
    var newArr = [];
    for (var i = 0; i < lines.length; i++) {
      newArr.push(repeat(' ', spaces).join('') + lines[i]);
    }
    return newArr.join('\n');
  }

  function specFailureDetails(result) {
    print(result.fullName);

    for (var i = 0; i < result.failedExpectations.length; i++) {
      var failedExpectation = result.failedExpectations[i];
      print(indent(failedExpectation.message, 2));
      print(indent(failedExpectation.stack, 2));
    }

    printNewline();
  }

  function suiteFailureDetails(result) {
    for (var i = 0; i < result.failedExpectations.length; i++) {
      printNewline();
      print(colored('red', 'An error was thrown in an afterAll'));
      printNewline();
      print(colored('red', 'AfterAll ' + result.failedExpectations[i].message));

    }
    printNewline();
  }
}

window.jasmine = jasmineRequire.core(jasmineRequire);

jasmineRequire.html(jasmine);

let env = jasmine.getEnv();

let jasmineInterface = jasmineRequire.interface(jasmine, env);

extend(window, jasmineInterface);

let queryString = new jasmine.QueryString({
  getWindowLocation: function() { return window.location; }
});

let catchingExceptions = queryString.getParam("catch");
env.catchExceptions(typeof catchingExceptions === "undefined" ? true : catchingExceptions);

let throwingExpectationFailures = queryString.getParam("throwFailures");
env.throwOnExpectationFailure(throwingExpectationFailures);

let htmlReporter = new jasmine.HtmlReporter({
  env: env,
  onRaiseExceptionsClick: function() { queryString.navigateWithNewParam("catch", !env.catchingExceptions()); },
  onThrowExpectationsClick: function() { queryString.navigateWithNewParam("throwFailures", !env.throwingExpectationFailures()); },
  addToExistingQueryString: function(key, value) { return queryString.fullStringWithNewParam(key, value); },
  getContainer: function() { return document.body; },
  createElement: function() { return document.createElement.apply(document, arguments); },
  createTextNode: function() { return document.createTextNode.apply(document, arguments); },
  timer: new jasmine.Timer()
});

let consoleReporter = new ConsoleReporter({
  timer: new jasmine.Timer(),
  print: function() {
    console.log.apply(console, arguments)
  }
});

env.addReporter(jasmineInterface.jsApiReporter);
env.addReporter(htmlReporter);
env.addReporter(consoleReporter);

let specFilter = new jasmine.HtmlSpecFilter({
  filterString: function() { return queryString.getParam("spec"); }
});

env.specFilter = function(spec) {
  return specFilter.matches(spec.getFullName());
};

window.setTimeout = window.setTimeout;
window.setInterval = window.setInterval;
window.clearTimeout = window.clearTimeout;
window.clearInterval = window.clearInterval;

let currentWindowOnload = window.onload;

window.onload = function() {
  if (currentWindowOnload) {
    currentWindowOnload();
  }
  htmlReporter.initialize();
  env.execute();
};

function extend(destination, source) {
  for (let property in source) destination[property] = source[property];
  return destination;
}
