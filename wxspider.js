var exec = require('child_process').exec,
    request = require('request'),
    http = require('http'),
    fs = require('fs'),
    iconv = require("iconv-lite"),
    url = require('url'),
    getPixels = require("get-pixels"),
    constHeight = 900,
    cmdStr = 'phantomjs src/index.js ';

var gm = require('gm').subClass({
    imageMagick: true
})

http.createServer(function (req, resp) {

    resp.setHeader("Access-Control-Allow-Origin", "*");
    resp.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    resp.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    resp.setHeader("X-Powered-By", ' 3.2.1');
    req.setEncoding('utf8');
    req.on('data', function (data) {
        // console.log(JSON.parse(data.toString()).url, 'data')

        if (req.url.indexOf('favicon') == -1) {
            // console.log(req.url.indexOf('download'))
            let us = JSON.parse(data.toString()).url
            exec(cmdStr + encodeURIComponent(us), function (err, stdout, stderr) {
                fs.readdir('./page', function (err, outfiles) {

                    if (err) {
                        console.log('open error:' + stderr);
                    } else {
                        console.log('start >>>>>>>>>>')
                        if (req.url.indexOf('download') > -1) { //下载
                            console.log('begin download >>>>>>>>>>')
                            var stm = fs.createReadStream('./page/' + outfiles[0]).pipe(resp)
                            stm.on('finish', function () {
                                console.log('finish success')
                                fs.unlinkSync('./page/' + outfiles[0])
                            })
                        } else if (req.url.indexOf('generate') > -1) { //一键生成
                            console.log('begin generate >>>>>>>>>>')
                            fs.readdir('./page', function (err, files) {
                                if (err) {
                                    console.log('open error:' + stderr);
                                } else {
                                    getPixels('./page/' + files[0], function (err, pixels) {
                                        console.log('height and width',pixels.shape.slice())
                                        var psHeight = pixels.shape.slice()[1],
                                            urls = [],
                                            delta = 0,
                                            ms = (psHeight - Math.floor(psHeight / constHeight) * constHeight) > 0 ? Math.floor(psHeight / constHeight) + 1 : Math.floor(psHeight / constHeight)
                                        var crops = function (d) {
                                            gm('./page/' + files[0]).crop(750, constHeight, 0, 240 + delta * constHeight).autoOrient().write('./temp/t' + d + '.jpg', function (err) {

                                                delta += 1

                                                if (!err) {

                                                    if (delta < ms) {
                                                        crops(delta)
                                                    } else {
                                                        // console.log('end up')
                                                        fs.readdir('./temp', function (err, files) {
                                                            var pos = [];
                                                            for (var i = 0; i < files.length; i++) {
                                                                pos.push(upPic(files[i]))
                                                            }

                                                            Promise.all(pos).then(function (res) {
                                                                // console.log('result urls', res)
                                                                urls = res;
                                                                upload()
                                                            })
                                                        })

                                                        function upPic(d) {
                                                            var formData = {
                                                                pic: fs.createReadStream('./temp/' + d)
                                                            }
                                                            return new Promise(function (resolve, reject) {
                                                                request.post({
                                                                    url: 'http://cardmanage-server.dev.sanqimei.com/upload/addTempImage',
                                                                    formData: formData
                                                                }, function (err, res, body) {
                                                                    console.log('url',body)
                                                                    if (!err) {
                                                                        resolve(body)
                                                                    } else {
                                                                        reject('上传失败')
                                                                    }
                                                                })
                                                            })
                                                        }
                                                    }
                                                }
                                            });
                                        }

                                        crops(delta)

                                        function upload() {
                                            console.log('urls', urls)
                                            console.log('begin upload')
                                            var last = urls.map(function (item) {
                                                return {
                                                    pic: item
                                                }
                                            })
                                            // console.log(last)
                                            request.post({
                                                url: 'http://cardmanage-server.dev.sanqimei.com/advertisementPage/addAdvertisementPage',
                                                headers: {
                                                    'Cookie': 'jessionId=74488c13-1eb7-4c1c-8ae0-8255bbc0ac6b'
                                                }
                                            }, function (err, res, body) {
                                                console.log('end upload')
                                                console.log(err, body)
                                                fs.readdir('./temp', function (err, files) {
                                                    files.forEach(function (item) {
                                                        fs.unlink('./temp/'+item)
                                                    })
                                                })

                                                fs.unlinkSync('./page/' + outfiles[0])
                                                resp.setHeader('Content-Type', 'application/json;charset=utf-8')
                                                resp.end(body, 'utf8')

                                            }).form({
                                                title: 'title'+(+new Date),
                                                picList: JSON.stringify(last)
                                            })
                                        }
                                    })
                                    console.log('end generate >>>>>>>');
                                }
                            });

                        }
                    }
                });
            })
        }
    })

}).listen('8048')