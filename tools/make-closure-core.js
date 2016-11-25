let
  compiler = require('google-closure-compiler-js').compile,
  fs = require('fs'),
  sourceFile = fs.readFileSync('./dist/global/ObservableAjax.js', 'utf8'),
  compilerFlags = {
    jsCode: [{src: sourceFile}],
    languageIn: 'ES5',
    createSourceMap: true
  },
  output = compiler(compilerFlags);

fs.writeFileSync('./dist/global/ObservableAjax.min.js', output.compiledCode, 'utf-8');
fs.writeFileSync('./dist/global/ObservableAjax.min.js.map', output.srouceMap, 'utf-8');