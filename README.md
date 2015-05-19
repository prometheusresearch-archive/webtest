# webtest

webtest is an opinionated webpack based test runner.

It has opinions on the following topics:

* You use webpack
* You use Jasmine test framework (this opinion can be lifted easily, send a PR
  if you want to add support for mocha, ...)

## Installation

    % npm install prometheusresearch/webtest

## Usage

Basic usage is to execute:

    % webtest .

which will try to find tests using `**/__tests__/*-test.js` glob pattern and
execute them within the PhantomJS headless browser.

## Custom test discovery

You can specify desired test suites by listsing them as arguments:

    % webtest ./lib/__tests__/Value-test.js

Another way is to use a glob pattern:

    % webtest ./lib/**/*-test.js

### Webpack configuration

Webtest looks for `webpack.config.js` file in the current directory and will use
it for building test bundle if it is available. You can use `--config` parameter
to specify alternative Webpack configuration for test bundle:

    % webtest --config webpack.config.test.js ...

You can also put Webtest entry configuration in `webtest.entry` key of Webpack configuration:

    module.exports = {

      // ... other webpack configuration

      webtest: {
        entry: [
          './lib/**/__tests__/*-test.js'
        ]
      }

    }

### Reference

You can execute `webtest --help` command to see a reference documentation on all
available `webtest` parameters:

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
      --version       Print version and exit

