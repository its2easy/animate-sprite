var fs = require('fs');
var path = require('path');
const { LIB_FILE_NAME } = require( './shared');

var source = path.join(__dirname, `../build/${LIB_FILE_NAME}.min.js`);
var dest = path.join(__dirname, `../example/${LIB_FILE_NAME}.min.js`);

fs.copyFile(source, dest, function (err) {
    if (err) return console.error(err);
    console.log('Copied to ' + dest);
});
