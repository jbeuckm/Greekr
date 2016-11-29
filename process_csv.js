var fs = require('fs');
var csv = require('csv');
var md4 = require('js-md4');

fs.createReadStream(__dirname+'/input.csv')
  .pipe(csv.parse({columns: true}))
  .pipe(csv.transform(function(record){

    record.my_field = md4(record.my_field);
    
    return record;
  }))
  .pipe(csv.stringify({ header: true }))
  .pipe(process.stdout);
