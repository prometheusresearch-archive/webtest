# webtest

webtest is an opinionated webpack based test runner.

It has opinions on the following topics:

* You use webpack
* You use Jasmine test framework (this opinion can be lifted easily, send a PR
  if you want to add support for mocha, ...)

## Installation

    % npm install prometheusresearch/webtest

## Usage

    % webtest --help
    Usage: webtest [entry]... [options]

    entry     Glob patterns to discover test cases  [$PWD/**/__tests__/*-test.js]

    Options:
      -r, --runtime   Runtime to execute tests in  [phantomjs]
      -c, --config    Webpack configuration  [$PWD/webpack.config.js]
      --context       Context  [$PWD]
      -p, --port      Port  [3000]
      --watch         Watch for changes and re-run tests
      --discover      Glob patter to discover tests  [**/__tests__/*-test.js]
      --debug         Debug mode
      --version       Print version and exit

