import Promise from 'bluebird';
import Phantom from 'phantom';
import autobind from 'autobind-decorator';
import formatStackTrace from './formatStackTrace';

let _phantom;

function runPhantom() {
  if (!_phantom) {
    _phantom = new Promise(resolve => Phantom.create(phantom => resolve(phantom)));
  }
  return _phantom;
}

export default class PhantomRunner {

  constructor(context) {
    let {options, testCompiler, frameworkCompiler} = context;
    this.context = context;
    this.href = `http://0.0.0.0:${options.port}`;
    testCompiler.plugin('invalid', this.pass);
    frameworkCompiler.plugin('invalid', this.pass);
    this.pass();
  }

  @autobind
  pass() {
    return runPhantom().then(phantom => new Promise(resolve => {
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
          page.close()
          resolve();
        });
      })
    }));
  }
}
