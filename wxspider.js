var exec = require('child_process').exec,
    request = require('request'),
    http = require('http'),
    fs = require('fs'),
    iconv = require("iconv-lite"),
    url = require('url'),
    getPixels = require("get-pixels"),
    constHeight = 900,
    topD = 0,
    uploadurl = 'http://cardmanage-server.sanqimei.com/upload/addTempImage',
    appendUrl = 'http://cardmanage-server.sanqimei.com/advertisementPage/addAdvertisementPage',
    cmdStr = 'phantomjs src/index.js ';

var gm = require('gm').subClass({
    imageMagick: true
})

http.createServer(function (req, resp) {
    console.log(req.method)
    // resp.setHeader("Access-Control-Allow-Credentials", "true");
    resp.setHeader("Access-Control-Allow-Origin", req.headers.origin);
    resp.setHeader("Access-Control-Allow-Headers", "X-Requested-With,token, tookie");
    resp.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    resp.setHeader("X-Powered-By", ' 3.2.1');
    if (req.method == 'OPTIONS') {
        resp.end()
    } else {

        resp.setHeader("test", ' 3.2.1');
        req.setEncoding('utf8');
        req.on('data', function (data) {
            // console.log(JSON.parse(data.toString()).url, 'data')
            console.log('cookie is', req.headers.tookie)
            console.log('url', req.url)

            if (req.url.indexOf('favicon') == -1) {
                var cookie = req.headers.tookie;
                // console.log(req.url.indexOf('download'))
                let us = JSON.parse(data.toString()).url
                exec(cmdStr + encodeURIComponent(us), function (err, stdout, stderr) {

                    console.log('phantom start ======================================================');
                    console.log(stdout);
                    if(stdout.indexOf('error')>-1){
                        resp.setHeader('Content-Type', 'application/json;charset=utf-8')
                        return resp.end(JSON.stringify({
                            errorMsg: '图片链接似乎有点问题o~'
                        }), 'utf8')
                    }
                    console.log('phantom end ======================================================')

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
                                fs.readdir('./page', function (err, ofiles) {
                                    if (err) {
                                        console.log('open error:' + stderr);
                                    } else {
                                        getPixels('./page/' + ofiles[0], function (err, pixels) {
                                            console.log('height and width', pixels.shape.slice())
                                            var psHeight = pixels.shape.slice()[1] - topD,
                                                urls = [],
                                                delta = 0,
                                                ms = Math.ceil(psHeight/constHeight)
                                            var crops = function (d) {
                                                d = ('00' + d).slice(-2)
                                                gm('./page/' + ofiles[0]).crop(750, constHeight, 0, topD + delta * constHeight).autoOrient().write('./temp/t' + d + '.jpg', function (err) {

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
                                                                    if(req.url.indexOf('getPics')>-1){
                                                                        console.log('获取所有截图链接开始>>>>>>>>>>>>')

                                                                        fs.unlinkSync('./page/' + ofiles[0])
                                                                        files.forEach(function (item) {
                                                                            fs.unlink('./temp/' + item)
                                                                        })
                
                                                                        resp.setHeader('Content-Type', 'application/json;charset=utf-8')
                                                                        resp.end(JSON.stringify({
                                                                            status: '1',
                                                                            result: {
                                                                                pic: urls
                                                                            }
                                                                        }), 'utf8')
                                                                        console.log('获取所有截图链接结束>>>>>>>>>>>>')
                                                                    }else{
                                                                        upload()
                                                                    }
                                                                }).catch(function (e) {
                                                                    resp.setHeader('Content-Type', 'application/json;charset=utf-8')
                                                                    return resp.end(JSON.stringify({
                                                                        errorMsg: '上传图片出错了~'
                                                                    }), 'utf8')
                                                                })
                                                            })

                                                            function upPic(d) {
                                                                var formData = {
                                                                    pic: fs.createReadStream('./temp/' + d)
                                                                }
                                                                return new Promise(function (resolve, reject) {
                                                                    // setTimeout(function () {
                                                                        console.log('ddddd',d)
                                                                        request.post({
                                                                            url: uploadurl,
                                                                            formData: formData
                                                                        }, function (err, res, body) {
                                                                            console.log('url', body)
                                                                            if (!err) {
                                                                                resolve(body)
                                                                            } else {
                                                                                reject('上传失败')
                                                                            }
                                                                        })
                                                                    // }, d.slice(1,3)*3000)                                                                                             
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
                                                    url: appendUrl,
                                                    headers: {
                                                        'Cookie': 'jessionId='+cookie
                                                        // 'Cookie': 'jessionId=447650f5-a076-4597-a149-68333f9f8c89'
                                                    }
                                                }, function (err, res, body) {
                                                    console.log('end upload')
                                                    console.log(err, body)
                                                    if (err) {
                                                        resp.setHeader('Content-Type', 'application/json;charset=utf-8')
                                                        resp.end({
                                                            errorMsg: '上传大图又失败了~'
                                                        }, 'utf8')
                                                    } else {
                                                        fs.readdir('./temp', function (err, files) {
                                                            files.forEach(function (item) {
                                                                fs.unlink('./temp/' + item)
                                                            })
                                                        })

                                                        fs.unlinkSync('./page/' + outfiles[0])
                                                        resp.setHeader('Content-Type', 'application/json;charset=utf-8')
                                                        resp.end(body, 'utf8')
                                                    }

                                                }).form({
                                                    title: 'title' + (+new Date),
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

    }

}).listen('8048')