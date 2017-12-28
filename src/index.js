var webserver = require('webserver')
var server = webserver.create();
// var request = require('request');

var urls = []
var webpage = require('webpage')



server.listen('127.0.0.1:8049', {
    // 'keepAlive': true
}, function(req, response) {
    console.log(req.url)
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    response.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    response.setHeader("X-Powered-By", ' 3.2.1');

    if (req.url.indexOf('favicon') >= 0) {
        response.status = 200;
        response.write('');
        response.close();
        // console.log(req.url, req.url.indexOf('favicon'), 'true---')
    } else {

        // var loc = req.url.indexOf('=');
        // console.log(JSON.stringify(req),'===')
        // var sp = req.url.slice(loc + 1)
        var sp = JSON.parse(req.post).url
        console.log(JSON.parse(req.post).url)
        if (!sp) {
            response.status = 500;
            response.write('缺少参数');
            response.close();
        } else {
            // console.log(decodeURIComponent(sp))
            urls.push(sp + '#rd')
                // urls.push("https://mp.weixin.qq.com/s?__biz=MzU4MTAzNjQyNA==&tempkey=OTM3X3lJK0k4UGNsbElUazVrbG9TNnhCUGg3bFY4NmlPSHBhUHVFR3ZFNGFyRDdNWU5faDE2cXRtT2RzVy1SSzNTd3VCaTlTLUwzdnItd2RWQ0xDblJ4ZEVYZFQxd2V1WWdRQmNCNVpFeXozR2NnclFDNi0yUUN2cFZYUENyRlJmeDBRQUFEbHBzR25rUlVhMWM0Tl9mSmRQdlg4eE8wMGx0UjI2cENSbkF%2Bfg%3D%3D&chksm=7d4cf28c4a3b7b9a15fd1b9eaa79d03d5910f9b18ae69dcffb72264300b2a2cbb739195d0c3f#rd");
                // urls.push("https://mp.weixin.qq.com/s?__biz=MzU4MTAzNjQyNA==&tempkey=OTM3X0FIWXd5UlREREprZm5jZ2VTNnhCUGg3bFY4NmlPSHBhUHVFR3ZFNGFyRDdNWU5faDE2cXRtT2RzVy1TT2lFWUdNczZOS3ktMm5XXzE1RUI1S3BaLWF2SjBLRDFOVExjNkU1LXNBSGI5eGJENko4dGRlUUhaZHdPR2Y1VWhOS1VZSE9KMHJrZ0hQak94T1UxWjgyWmRGckNPd2JxMHItanQ3a2NMUUF%2Bfg%3D%3D&chksm=7d4cf2bc4a3b7baa1a6dc2a30a4b3e2cb2574dff8099207b46712b3715bca524a2ac061e7c54#rd");
                // urls.push("https://mp.weixin.qq.com/s?__biz=MzU4MTAzNjQyNA==&tempkey=OTM3Xy9XK3ZZRXcwemd1eSt3WUdTNnhCUGg3bFY4NmlPSHBhUHVFR3ZFNGFyRDdNWU5faDE2cXRtT2RzVy1SSGpmdUFuOWpMQ0FJR2lIRXYza2h3bFEzNkJLdnotWFU3TFZHVnF0SEZWX3JXdnRCRXJfd1RRRXVPVF9sTEZwUHJWdThBWVhFTFBMdExkVEwyZ1pPdjAzUUdmUFVzc21wMHFKT3RrZ2RRTEF%2Bfg%3D%3D&chksm=7d4cf2bb4a3b7badd22f4417f29e5bc13d9dd2ca36e6ab390caa727aa43cbd3fbfd887555f8a#rd");
                // urls.push("https://mp.weixin.qq.com/s?__biz=MzU4MTAzNjQyNA==&tempkey=OTM3X2JRa0JSYTROdXBzZWtMWVFTNnhCUGg3bFY4NmlPSHBhUHVFR3ZFNGFyRDdNWU5faDE2cXRtT2RzVy1SV2I3aV9HQW1hUnd2SXNzUzU0OU9tRlRFVXd1Rm53Vmt2eGdrLUhFN01QNWhiVUFJcmRtdmtob2w3M0ZPbENxRWRwVFpWS3RJSUhBdVJDVUluMl9IckpoeGZwbnVlUU1wXzZQeGY1Q3MydXd%2Bfg%3D%3D&chksm=7d4cf2bf4a3b7ba9053222a7ec039bf62da4023ca133dc2a80c5bd35329ef82a949a461667a2#rd");
            var page = webpage.create()

            // page.viewportSize = {width: 900, height: 500}

            page.settings.userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1"

            var originTime = +new Date()
            var startTime = +new Date()
            var loadedImgCount = 0
            var imgCount = 0
            var summaryCount = 0
            console.log('总页面数', urls.length)


            function renderAction() {
                loadedImgCount++
                var now = +new Date()
                var custom = (now - startTime) / 1000
                var title = page.title.replace(/\//g, '|')

                console.log('渲染第' + loadedImgCount + '张页面，耗时：' + custom + 's')
                console.log('渲染到', './page/' + title + '.png')
                startTime = +new Date()

                page.render('./page/' + title + '.png')

                request('./page/' + title + '.png').pipe(fs.createWriteStream('qqq.png'))
            }

            page.onConsoleMessage = function(msg) {

                if (msg.indexOf("IMGLOAD") >= 0) {
                    imgCount++
                    if (imgCount == summaryCount) {
                        renderAction()
                        renderPage()
                    }
                }
                if(msg.indexOf('NODOM') >= 0){
                    response.write(msg)
                    response.close()
                }
            }

            function renderPage() {

                if (urls.length) {
                    var url = urls.shift()
                    console.log('渲染url', url)
                    page.open(url, function(status) {
                        console.log('open', status)
                        imgCount = 0
                        var res = page.evaluate(function() {
                            var LoadedImgs = []
                            var imgs = document.getElementsByTagName('img')
                            var count = 0
                            for (var i in imgs) {
                                var img = imgs[i]
                                var imgDataSrc = img && img.getAttribute && img.getAttribute('data-src')
                                var imgSrc = img && img.getAttribute && img.getAttribute('src')

                                if (imgDataSrc && imgSrc && imgDataSrc !== imgSrc) {
                                    img.onload = function() {
                                        console.log('[IMGLOAD]')
                                    }
                                    img.setAttribute('src', imgDataSrc)
                                    LoadedImgs.push({
                                        src: imgSrc,
                                        dataSrc: imgDataSrc
                                    })
                                    count++
                                }
                            }
                            try {
                                var content = document.getElementById('js_content')
                                var bc = content.getBoundingClientRect();
                                var top = bc.top;
                                var left = bc.left;
                                var width = bc.width;
                                var height = bc.height;
                                window.scrollTo(0, 10000); //滚动到底部  
                                var lengths = [top, left, width, height];

                                var res = { imgArray: LoadedImgs, lengths: lengths }

                                return res
                            } catch (e) {

                                console.log('[NODOM]')
                                return {lengths:[]}
                            }


                        })

                        page.clipRect = {
                            top: res.lengths[0],
                            left: res.lengths[1],
                            width: res.lengths[2],
                            height: res.lengths[3]
                        }

                        summaryCount = res.imgArray.length
                        if (summaryCount == 0) {
                            renderAction()
                            renderPage()
                        }
                        // console.log(JSON.stringify(res))
                    })
                } else {
                    window.setTimeout(function() {
                        var cost = (+new Date() - originTime) / 1000
                        console.log('渲染完成,耗时', cost, 's')
                            // phantom.exit();
                        page.close()

                        response.status = 200;
                        response.write('ooo.jpg');
                        response.close();

                    }, 1000);
                }
            }

            renderPage()
        }
    }
})