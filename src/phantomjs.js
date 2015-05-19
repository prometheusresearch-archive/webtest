import debug from 'debug';
import Promise from 'bluebird';
import Phantom from 'phantom';
import autobind from 'autobind-decorator';
import formatStackTrace from './formatStackTrace';

let log = debug('webtest:phantomjs');

let _phantom;

function runPhantom() {
  if (!_phantom) {
    _phantom = new Promise(resolve => Phantom.create(phantom => resolve(phantom)));
  }
  return _phantom;
}

export default class PhantomRunner {

  constructor(context) {
    let {options, testCompiler, framework} = context;
    this.context = context;
    this.href = `http://0.0.0.0:${options.port}`;
    if (options.watch) {
      testCompiler.plugin('invalid', this.run);
      framework.compiler.plugin('invalid', this.run);
    }
  }

  @autobind
  run() {
    return runPhantom().then(phantom => new Promise(resolve => {
      log('start running tests');
      phantom.createPage(page => {
        page.onConsoleMessage(msg => {
          console.log(msg)
        });
        page.onError((err, frames) => {
          page.evaluate(() => window.__webtest_sourceMap__, (sourceMap) => {
            frames = frames.map(f => ({filename: f.file, line: f.line, column: 0}));
            let stack = formatStackTrace(sourceMap, frames);
            console.log(err + '\n' + stack);
          });
        });
        page.open(this.href, status => {
          log('end running tests');
          page.close()
          resolve();
        });
      })
    }));
  }
}
