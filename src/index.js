var urls = ['https://mp.weixin.qq.com/s?__biz=MzI5ODk4Njc3NQ==&tempkey=OTM3X3VWY2JuQ2U1SWtzTVR6S3hXZEFndE1jVDJWa2RENlRrRmNMOHg5MWFhRGxmLTZmRmxKQ1ZzZnZicWIweVVwSXZ5RWliUVdCeGR0WDgxNzBoNDc2d2hPT2F6RXM3M0VRTWFiUk8wc21MNjlhdmQyT2wwamwyVE5jbkY5RnpkZjAxVUNvYUlyMTRPQTZqbTY1VXRRdE5IM0dwczBzRFVXaTRYMTM0R2d%2Bfg%3D%3D&chksm=6c9c3d7a5bebb46cd41149788337c04da56256c1bb01adffee0fb0eafdf5fe514ca945f5c870&scene=0&previewkey=3A9PT1DdNj7cioBuj4Scb8wqSljwj2bfCUaCyDofEow%253D&key=&ascene=1&uin=&devicetype=Windows+7&version=62060028&lang=zh_CN&winzoom=1##']
var webpage = require('webpage')


var page = webpage.create()
var system = require('system');
var args = system.args;


// page.viewportSize = {width: 725, height: 500}
// page.clipRect = { top: 0, left: 150, width: 725};


page.settings.userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1"
// page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
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
    var title = page.title.replace(/\//g, '|') || 'temp'

    console.log('渲染第' + loadedImgCount + '张页面，耗时：' + custom + 's')
    console.log('渲染到', './page/' + title + '.png')
    startTime = +new Date()

    page.render('./page/' + title + '.png')
}

page.onConsoleMessage = function (msg) {
console.log(msg)
    if (msg.indexOf("IMGLOAD") >= 0) {
        imgCount++
        if (imgCount == summaryCount) {
            renderAction()
            renderPage()
        }
    }
}

function renderPage() {
    if (args.length === 1) {
        return console.log('Try to pass some arguments when invoking this script!');
    } else {
        // console.log(args)
        args.forEach(function (arg, i) {
            // console.log(i + ': ' + arg);
        });
    }

    if (urls.length) {
        var url = urls.shift()
        console.log('渲染url', (decodeURIComponent(args[1])))
        page.open(url, function () {
            imgCount = 0
            var res = page.evaluate(function () {
                var LoadedImgs = []
                var imgs = document.getElementsByTagName('img')
                var count = 0
                for (var i in imgs) {
                    var img = imgs[i]
                    var imgDataSrc = img && img.getAttribute && img.getAttribute('data-src')
                    var imgSrc = img && img.getAttribute && img.getAttribute('src')

                    if (imgDataSrc && imgSrc && imgDataSrc !== imgSrc) {
                        img.onload = function () {
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
                    // window.scrollTo(0, 10000); //滚动到底部  
                    var lengths = [top, left, width, height];
    
                    // var res = { imgArray: LoadedImgs, lengths: lengths }
                    console.log( JSON.stringify(bc),'============')

                    var res = { imgArray: LoadedImgs, lengths: lengths }

    
                } catch (e) {
    
                    console.log('[NODOM]',e.message)
                    return {lengths:[]}
                }

                return res
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
            // console.log(JSON.stringify(imgArray))
        })
    } else {
        window.setTimeout(function () {
            var cost = (+new Date() - originTime) / 1000
            console.log('渲染完成,耗时', cost, 's')
            phantom.exit();
        }, 1000);
    }
}

renderPage()