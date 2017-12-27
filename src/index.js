var webserver = require('webserver')
var server = webserver.create();

var urls = []
var webpage = require('webpage')


server.listen('127.0.0.1:8050',{
  // 'keepAlive': true
},function(request, response){

  
  var query = request.url.split('?')[1];
  // console.log(query,'===')
  var sp = query.split('=')[1]
  if(!query || !sp){
      response.status=500;
      response.write('缺少参数');
      response.close();
  }
  console.log(decodeURIComponent(sp))
  // urls.push(sp)
  urls.push("https://mp.weixin.qq.com/s?__biz=MzI1NDk5MzU4Nw==&tempkey=OTM2X1dEaWJkaThMM3l3R09OQytINnNiSnNIb0FGb29TLUVkdHlxWDljRU5Gb2s5YklMQVlacEVmd1d6UjZaTFp3QW1YRHFjVUVoLU1BUWdQTjF1S1hIQkM5SGYyN0pfSFNDNWdIZWNGWmF4V2pnT1pIczVnV18teE9RQWJpeDBTMnNoLWE1alpCbE5MTWdvSXctaEZMWTh4djdXZHV4ZzRwc0xhcUZVOHd%2Bfg%3D%3D&chksm=6a3df4de5d4a7dc8f8860591c4c9eef874c874cccde0e3368c2769d9a6cc81795b8934b16cfb#rd");
  var page = webpage.create()

var u = ['http://mp.weixin.qq.com/s?__biz=MzA5NTEzNzgyMA==&mid=2654788368&idx=1&sn=3e82ac8ce808ce5c6e2d9c7e902d1c09&scene=21#wechat_redirect']
// urls = u

// page.viewportSize = {width: 900, height: 500}



page.settings.userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1"

var originTime = +new Date()
var startTime = +new Date()
var loadedImgCount = 0
var imgCount = 0
var summaryCount = 0
console.log('总页面数', urls.length)


function renderAction(){
  loadedImgCount++
  var now = +new Date()
  var custom = (now - startTime)/1000
  var title = page.title.replace(/\//g, '|')

  console.log('渲染第'+loadedImgCount+'张页面，耗时：'+custom+'s')
  console.log('渲染到','./page/' + title+'.png')
  startTime = +new Date()
  
  page.render('./page/' + title+'.png')
}

page.onConsoleMessage = function(msg) {

  if(msg.indexOf("IMGLOAD")>=0){
    imgCount++
    if(imgCount == summaryCount){
      renderAction()
      renderPage()
    }
  } 
}

function renderPage(){
  
  if(urls.length){
    var url = urls.shift()
    console.log('渲染url', url)
    page.open(url, function(){
      imgCount = 0
      var res = page.evaluate(function(){
        var LoadedImgs = []
        var imgs = document.getElementsByTagName('img')
        var count =  0
        for(var i in imgs){
          var img = imgs[i]
          var imgDataSrc = img && img.getAttribute && img.getAttribute('data-src')
          var imgSrc = img && img.getAttribute && img.getAttribute('src')

          if( imgDataSrc && imgSrc && imgDataSrc !== imgSrc){
            img.onload = function(){
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

        var content = document.getElementById('js_content')
        var bc = content.getBoundingClientRect();  
        var top = bc.top;  
        var left = bc.left;  
        var width = bc.width;  
        var height = bc.height;  
        window.scrollTo(0, 10000);//滚动到底部  
        var lengths = [top, left, width, height]; 

        var res = {imgArray: LoadedImgs, lengths: lengths}

        return res
      })

      page.clipRect = {
        top:res.lengths[0],
        left:res.lengths[1],
        width:res.lengths[2],
        height:res.lengths[3]
      }

      summaryCount = res.imgArray.length
      if(summaryCount == 0){
        renderAction()
        renderPage()
      }
      // console.log(JSON.stringify(res))
    })
  }else {
    window.setTimeout(function () {
      var cost = (+new Date() - originTime)/1000
      console.log('渲染完成,耗时', cost, 's')
      // phantom.exit();

      response.status=200;
      response.write('ooo.jpg');
      response.close();

    }, 1000);
  }
}

renderPage()
})