let noopTimer = {
  start: function(){},
  elapsed: function(){ return 0; }
};

function ConsoleReporter(options) {
  let print = options.print,
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

    let dots = [];

    for (let i = 0; i < specs.length; i++) {
      let result = specs[i];
      if (result.status == 'pending') {
        dot.push(colored('yellow', '*'));
      } else if (result.status == 'passed') {
        dots.push(colored('green', '.'));
      } else if (result.status == 'failed') {
        dots.push(colored('red', 'F'));
      }
    }

    print(dots.join(''));

    for (let i = 0; i < failedSpecs.length; i++) {
      specFailureDetails(failedSpecs[i]);
    }

    if(specCount > 0) {

      let specCounts = specCount + ' ' + plural('spec', specCount) + ', ' +
        failureCount + ' ' + plural('failure', failureCount);

      if (pendingCount) {
        specCounts += ', ' + pendingCount + ' pending ' + plural('spec', pendingCount);
      }

      print(specCounts);
    } else {
      print('No specs found');
    }

    let seconds = timer.elapsed() / 1000;
    print('Finished in ' + seconds + ' ' + plural('second', seconds));

    for(i = 0; i < failedSuites.length; i++) {
      suiteFailureDetails(failedSuites[i]);
    }

    onComplete(failureCount === 0);
  };

  this.specDone = function(result) {
    specs.push(result);
    if (result.status !== 'disabled') {
      specCount++;
    }
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
    let arr = [];
    for (let i = 0; i < times; i++) {
      arr.push(thing);
    }
    return arr;
  }

  function indent(str, spaces) {
    let lines = (str || '').split('\n');
    let newArr = [];
    for (let i = 0; i < lines.length; i++) {
      newArr.push(repeat(' ', spaces).join('') + lines[i]);
    }
    return newArr.join('\n');
  }

  function specFailureDetails(result) {
    print(result.fullName);

    for (let i = 0; i < result.failedExpectations.length; i++) {
      let failedExpectation = result.failedExpectations[i];
      print(indent(failedExpectation.message, 2));
      print(indent(failedExpectation.stack, 2));
    }

    printNewline();
  }

  function suiteFailureDetails(result) {
    for (let i = 0; i < result.failedExpectations.length; i++) {
      printNewline();
      print(colored('red', 'An error was thrown in an afterAll'));
      printNewline();
      print(colored('red', 'AfterAll ' + result.failedExpectations[i].message));

    }
    printNewline();
  }
}

export default ConsoleReporter;
