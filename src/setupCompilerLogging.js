export default function setupCompilerLogging(compiler, log) {
  compiler.plugin('done', function() {
    log('done');
  });
  compiler.plugin('compile', function() {
    log('compile');
  });
  compiler.plugin('invalid', function() {
    log('invalid');
  });
}

