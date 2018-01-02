var exec = require('child_process').exec
var request = require('request')
var http = require('http')
var fs = require('fs')
var cmdStr = 'npm run start';
exec(cmdStr, function(err, stdout, stderr) {
    if (err) {
        console.log('open error:' + stderr);
    } else {
        // var data = JSON.parse(stdout);
        console.log(stdout);
    }
});
http.createServer(function(req, res) {
    console.log(req.url)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.setHeader("X-Powered-By", ' 3.2.1');
    if (!req.url.indexOf('favicon') > -1) {
        // const fc = fs.statSync('./page')
        fs.readdir('./page', function(err, files) {

            if (!files || !files[0]) {
                res.setHeader('Content-Type', 'application/json;charset=utf-8')
                res.statusCode = 500
                res.end(JSON.stringify({ errCode: 1, msg: '没有可供下载文件' }), 'utf-8')
            } else {
                res.setHeader('Content-Type', 'application/octet-stream')
                res.setHeader('Content-Disposition', 'attachment;filename=' + files[0])
                fs.createReadStream('./page/' + files[0]).pipe(res)
            }
        })
    }

}).listen('8048')