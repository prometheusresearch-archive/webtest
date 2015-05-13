import createStackMapper from 'stack-mapper';
import ConsoleReporter from './ConsoleReporter';

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

function formatStackLine(line) {
  if (line.name) {
    return `    at ${line.name} (${line.filename}:${line.line})`;
  } else {
    return `    at ${line.filename}:${line.line}`;
  }
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

function mapStack(stack) {
  let lines = stack.split('\n');
  lines = lines
    .map(parseStackLine)
    .filter(Boolean)
    .filter(line => !/jasmine-core\/lib\/jasmine-core/.exec(line.filename))
    .filter(line => !/webpack\/bootstrap/.exec(line.filename))
    .filter(line => !/framework\/bundle.js/.exec(line.filename));
  lines = stackMapper.map(lines)
    .map(line => ({...line, filename: line.filename.replace(/^webpack:\/\/\//, '')}))
    .filter(line => !/webpack\/bootstrap/.exec(line.filename))
    .map(formatStackLine);
  return lines.join('\n');
}

let __ExceptionFormatter = jasmineRequire.ExceptionFormatter();
jasmineRequire.ExceptionFormatter = function() {
  return function() {
    let underlying = new __ExceptionFormatter();
    this.message = underlying.message;
    this.stack = function(err) {
      if (!err || !err.stack || !SOURCE_MAP) {
        return underlying.stack(err);
      } else {
        return mapStack(err.stack);
      }
    };
  };
};

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
