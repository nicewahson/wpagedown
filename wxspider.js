var exec = require('child_process').exec
var request = require('request')
var http = require('http')
var fs = require('fs')
var iconv = require("iconv-lite")
var url = require('url')
var cmdStr = 'phantomjs src/index.js ';
// exec(cmdStr, function(err, stdout, stderr) {
//     if (err) {
//         console.log('open error:' + stderr);
//     } else {
//         // var data = JSON.parse(stdout);
//         console.log(stdout);
//     }
// });
http.createServer(function (req, res) {
    // console.log(url.parse(req.url).query.slice(4))
    console.log(req.url)

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.setHeader("X-Powered-By", ' 3.2.1');
    req.on('data', function (data) {
        // console.log(JSON.parse(data.toString()).url, 'data')


        if (req.url.indexOf('favicon') == -1) {

            let us = JSON.parse(data.toString()).url
            // console.log(req.url.slice(6), '+++++++++')
            // const fc = fs.statSync('./page')
            exec(cmdStr + encodeURIComponent(us), function (err, stdout, stderr) {
                fs.readdir('./page', function (err, files) {

                    // if (files[0]) {
                    //     // res.setHeader('Content-Type', 'application/json;charset=utf-8')
                    //     // res.statusCode = 500
                    //     // res.end(JSON.stringify({
                    //     //     errCode: 1,
                    //     //     msg: '没有可供下载文件'
                    //     // }), 'utf-8')
                    // } else {
                    // console.log(cmdStr + us)


                    if (err) {
                        console.log('open error:' + stderr);
                    } else {
                        // var data = JSON.parse(stdout);
                        console.log(stdout);

                        // res.setHeader('Content-Type', 'application/octet-stream')
                        // res.setHeader('Content-Disposition', 'attachment;filename=temp.png')
                        fs.createReadStream('./page/' + files[0]).pipe(res)
                        res.on('end', function(){
                            fs.unlinkSync('./page/' + files[0])
                        })
                        
                        // res.end(JSON.stringify({
                        //     errCode: 0,
                        //     msg: '下载成功'
                        // }), 'utf-8')
                    }
                });


                // }
            })

        }
    })

}).listen('8048')