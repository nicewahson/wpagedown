var exec = require('child_process').exec,
    request = require('request'),
    http = require('http'),
    fs = require('fs'),
    iconv = require("iconv-lite"),
    url = require('url'),
    getPixels = require("get-pixels"),
    constHeight = 900

var gm = require('gm').subClass({
    imageMagick: true
})
fs.readdir('./page', function (err, files) {

    if (err) {
        console.log('open error:' + stderr);
    } else {
        console.log('begin')
        // var stm = fs.createReadStream('./page/' + files[0]).pipe(res)
        console.log(files[0]);
        getPixels('./page/' + files[0], function (err, pixels) {
            console.log(pixels.shape.slice())
            var psHeight = pixels.shape.slice()[1],
                urls = [],
                delta = 0,
                ms = (psHeight - Math.floor(psHeight / constHeight) * constHeight) > 0 ? Math.floor(psHeight / constHeight) + 1 : Math.floor(psHeight / constHeight)
            var crops = function (d) {
                gm('qqq.jpg').crop(750, constHeight, 0, 200 + delta * constHeight).autoOrient().write('./temp/q' + d + '.jpg', function (err) {

                    delta += 1

                    if (!err) {

                        if (delta < ms) {
                            crops(delta)
                        } else {
                            console.log('end up')
                            fs.readdir('./temp', function (err, files) {
                                var pos = [];
                                for (var i = 0; i < files.length; i++) {
                                    pos.push(upPic(files[i]))
                                }

                                Promise.all(pos).then(function (res) {
                                    console.log('lll', res)
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
                                        console.log(body)
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
                var last = urls.map(function (item) {
                    return {
                        pic: item
                    }
                })
                console.log(last)
                request.post({
                    url: 'http://192.168.88.208/advertisementPage/addAdvertisementPage',
                    headers: {
                        'Cookie': 'jessionId=2cb8e16d-f479-464c-b859-3a4dd82b3ce6'
                    }
                }, function (err, res, body) {
                    console.log('end')
                    console.log(err, body)
                    fs.readdir('./temp', function(err, files){
                        files.forEach(function(item){
                            // fs.unlink('./temp/'+item)
                        })
                    })
                }).form({
                    title: 'title',
                    picList: JSON.stringify(last)
                })
            }

        })
        console.log('end');
    }
});