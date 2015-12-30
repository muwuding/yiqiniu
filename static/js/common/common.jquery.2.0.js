/*
* name:    H5公用方法
* version: 2.0
* info:    支持一起牛APP投顾大版本，基于jquery
* more:    支持的接口及功能请查看相应的文档，支持模块化调用
* update:  2015-12-30
*/

! function (global, factory) {
  "function" == typeof define && (define.amd || define.cmd) ? define(function () {
    return factory(global)
  }) : factory(global, !0)
}(this, function (global, factory){

  var ua = navigator.userAgent.toLowerCase(), // 浏览器标识
      isAndroid = -1 != ua.indexOf("android"), // 安卓版
      isIos = -1 != ua.indexOf("iphone") || -1 != ua.indexOf("ipad"), // IOS版
      isYiqiniu = -1 != ua.indexOf("yiqiniu"), // 一起牛APP
      J_h5niu; // JS对象

  J_h5niu = {


    /*使用rem初始化页面,自执行*/
    fontSize: function() {

      var page = this;
      var html = document.getElementsByTagName("html")[0];
      page.width = 320;
      page.fontSize = 100;
      page.widthProportion = function(){
         var p = (html.offsetWidth)/page.width;
         return p>2?2:p<1?1:p;
      };
      page.changePage = function(){
          html.setAttribute("style","font-size:" + page.widthProportion() * page.fontSize + "px !important");
      };
      page.changePage();
      window.addEventListener("resize",function(){page.changePage();},false);
    },

    /*获取url中的参数*/
    getUrlParam : function(name) {
      var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)'),
          r = window.location.search.substr(1).match(reg);

      if(r != null){
        return unescape(r[2]);
      } else{
        return null;
      }
    },

    /*生成唯一数*/
    onlyNum : function() {
      var num = '',
        timestamp = '',
        randomNum = '';

      timestamp = (new Date()).valueOf();

      for(var r = 0; r < 6; r++) {
        randomNum +=Math.floor(Math.random()*10);
      }
      num = timestamp + randomNum;
      return num;
    },

    /*为空处理*/
    isNull : function(text) {
       if(typeof text === "undefined" || text === null){
         return '';
       }else{
         return text;
       }
    },

    /*AJAX请求封装，data需传递对象*/
    ajax : function(url,data,callback,error){
      $.ajax({
        type: "POST",
        url : url,
        data: JSON.stringify(data),
        dataType:"json",
        contentType:"application/json",
        success: callback,
        error: function(){
          if(error){
            error;
          }else{
            console.log("请求失败");
          }
        }
      });
    },

    /*计算时间差，参数为时间戳*/
    timeDifference : function(timestamps) {

      var formatNumber = function(n) {
        if(n < 10) {
          n = '0' + n;
        }
        return n;
      };

      var originalTime = new Date(timestamps),
          currentTime = (new Date()).getTime(),
          interval = currentTime - timestamps,
          days,
          hours,
          minutes,
          seconds,
          timeHtml = '';

      days = Math.floor(interval / (24 * 3600 * 1000)); //相差天数
      hours = Math.floor(interval / (3600 * 1000)); //相差小时数
      minutes = Math.floor(interval / (60 * 1000)); //相差分钟
      seconds = Math.floor(interval / 1000); //相差秒数

      var adjustedYear = originalTime.getFullYear(),
          adjustedMonth = formatNumber((originalTime.getMonth() + 1)),
          adjustedDate = formatNumber(originalTime.getDate()),
          adjustedHours = formatNumber(originalTime.getHours()),
          adjustedMinutes = formatNumber(originalTime.getMinutes()),
          adjustedSeconds = formatNumber(originalTime.getSeconds());

      var nowTime = new Date;

      if(originalTime.getFullYear() == nowTime.getFullYear() && originalTime.getMonth() == nowTime.getMonth() && originalTime.getDate() == nowTime.getDate()) {
        if(seconds < 60) {
          timeHtml = '刚刚';
        } else if (minutes < 60) {
          timeHtml = minutes + '分钟前';
        } else {
          timeHtml = '今天&nbsp;' +
                  adjustedHours + ':' +
                  adjustedMinutes;
        }
      } else if(originalTime.getFullYear() == nowTime.getFullYear() && originalTime.getMonth() == nowTime.getMonth() && originalTime.getDate() == (nowTime.getDate() - 1)) {
        timeHtml = '昨天&nbsp;' +
                adjustedHours + ':' +
                adjustedMinutes;
      } else {
        var yearHtml = '';

        if(adjustedYear != (new Date()).getFullYear()) {
          yearHtml = adjustedYear + '年'
        }

        timeHtml += yearHtml +
                  adjustedMonth + '月' +
                  adjustedDate + '日&nbsp;' +
                  adjustedHours + ':' +
                  adjustedMinutes;
      }
      return timeHtml;
    },

    /*微信分享封装，doption为传入对象，分享地址，图片地址需为绝对地址*/
    shareByWeixin : function(doption) {

      var ua = navigator.userAgent.toLowerCase();

      if(ua.indexOf('micromessenger') > -1){

        var options = {};

        /*获取签名*/
        $.ajax({
          type : "post",
          async : false, /*同步执行*/
          url : window.location.protocol + "//" + window.location.host + "/web/getWxSignature",
          dataType : "json",
          data : {
            "url" : window.location.href
          },
          success : function(data) {

            options = {
              debug: false,
              appId: 'wx06d05f7e4f8d0fdc',
              timestamp: data.timestamp,
              nonceStr: data.nonceStr,
              signature: data.signature,
              jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage','onMenuShareQQ','onMenuShareWeibo'],
              title:doption.title,
              desc:doption.desc,
              link:doption.link,
              imgUrl:doption.imgUrl
            };
            /*调用微信分享方法*/
            niuWebShare(options);
          },
          error : function(errorMsg) {
            return ;
          }
        });

        /*微信分享样式自定义方法*/
        function niuWebShare (options) {

          var options = options;

          if(!options){
            console.log("error:没有正确配置参数！");
            return true;
          }

          wx.config({
            debug: options.debug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: options.appId, // 必填，公众号的唯一标识
            timestamp: options.timestamp, // 必填，生成签名的时间戳
            nonceStr: options.nonceStr, // 必填，生成签名的随机串
            signature: options.signature,// 必填，签名，见附录1
            jsApiList: options.jsApiList // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
          });

          wx.ready(function(){
            /*---分享给朋友---*/
            wx.onMenuShareAppMessage({
              title: options.title, // 分享标题
              desc: options.desc, // 分享描述
              link: options.link, // 分享链接
              imgUrl: options.imgUrl, // 分享图标
              type: '', // 分享类型,music、video或link，不填默认为link
              dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
              success: function () {
                console.log("----朋友分享成功的------");
              },
              cancel: function () {
                console.log("----朋友点击了取消------");
              }
            });

            /*---分享到朋友圈---*/
            wx.onMenuShareTimeline({
              title: options.title,
              link: options.link,
              imgUrl: options.imgUrl,
              success: function () {
                console.log("----朋友圈分享成功的------");
              },
              cancel: function () {
                console.log("----朋友圈点击了取消------");
              }
            });

            /*---分享到QQ---*/
            wx.onMenuShareQQ({
              title: options.title,
              desc: options.desc,
              link: options.link,
              imgUrl: options.imgUrl,
              success: function () {
                console.log("----qq分享成功的------");
              },
              cancel: function () {
                console.log("----qq点击了取消------");
              }
            });
          });
        };
      }
    },


    alert : function() {

    }
  };

  $(function() {

    J_h5niu.fontSize();
  });

  //抛出对象
  factory && (global.J_h5niu = J_h5niu);
});





