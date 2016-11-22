let 
  rollup = require('rollup'),
  fs = require('fs'),
  path = require('path');

rollup.rollup({
  entry: './dist/temp/ObservableAjax.js',
}).then(function(bundle){
  let result = bundle.generate({
    format: 'umd',
    moduleName: 'ObservableAjax',
    sourceMap: true,
  })
  fs.writeFileSync('./dist/ObservableAjax.js', result.code);
});