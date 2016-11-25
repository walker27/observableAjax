let 
  rollup = require('rollup'),
  fs = require('fs'),
  path = require('path');

rollup.rollup({
  entry: './dist/es6/ObservableAjax.js',
}).then(function(bundle){
  let result = bundle.generate({
    format: 'umd',
    moduleName: 'ObservableAjax',
    sourceMap: true,
  })
  fs.writeFileSync('./dist/global/ObservableAjax.js', result.code);
});