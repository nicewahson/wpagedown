var exec = require('child_process').exec
var request = require('request')
var http = require('http')
var fs = require('fs')
var iconv = require("iconv-lite")
var url = require('url')
var gm = require('gm').subClass({
    imageMagick: true
})
fs.readdir('./page', function (err, files) {

    if (err) {
        console.log('open error:' + stderr);
    } else {
        // var data = JSON.parse(stdout);
        console.log('stdout', gm)
        // var stm = fs.createReadStream('./page/' + files[0]).pipe(res)
        console.log(files[0]);
        gm('qqq.jpg').resize(400,400).autoOrient().write('qq1.jpg', function(a){
            console.log('a',a.message)
        });;
        console.log('end');
    }
});