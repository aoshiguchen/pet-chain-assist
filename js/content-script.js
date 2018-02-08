console.log('注入脚本!');

var config = {
	tpl: 'wallet',
	appId: 2
};

//加载js文件
function loadScript(url,callback){
	var el = document.createElement("script");
	el.type = "text/javascript";

	if(typeof(callback) != "undefined"){
		if (el.readyState) {
			el.onreadystatechange = function () {
				if (el.readyState == "loaded" || el.readyState == "complete") {
					el.onreadystatechange = null;
					callback();
				}
			};
		} else {
			el.onload = function () {
				callback();
			};
		}
	}

	el.src = url;
	document.head.appendChild(el);
};

var cache = function(){
  var storage = localStorage;

  return {
    set: function(k,v){
      storage.setItem(k,v);
    },
    get: function(k){
      return storage.getItem(k);
    },
    setJson: function(k,v){
      storage.setItem(k,JSON.stringify(v));
    },
    getJson: function(k){

      var val = storage.getItem(k);

      if(!val) return;
      else return JSON.parse(val);
    },
    setFlag: function(){
    	this.set('flag',true);
    },
    isFlag: function(){
    	return 'true' === this.get('flag');
    },
    rmFlag: function(){
    	this.set('flag',false);
    }
  };
};

//获取时间戳
function timestamp(){
	var date = new Date();
	return date.getTime();
}

//获取验证码
// function getAuthCode(){
// 	var ret;
// 	$.ajax({
// 		type: "POST",
// 		url: "https://pet-chain.baidu.com/data/captcha/gen",
// 		async: false,
// 		contentType: 'application/json',
// 		data: JSON.stringify({
// 			appId: config.appId,
// 			requestId: timestamp(),
// 			tpl: config.tpl
// 		}),
// 		dataType: "json",
// 		success: function(data){
// 			if(data && data.data && data.data.img){
// 				ret = 'data:image/png;base64,' + data.data.img;
// 			}
// 			// if(data && data.data){
// 			// 	ret =  data.data;
// 			// }
// 		}
// 	});

// 	return ret;
// }

//获取狗列表
function getList(){
	var ret = [];
	$.ajax({
		type: "POST",
		url: "https://pet-chain.baidu.com/data/market/queryPetsOnSale",
		async: false,
		contentType: 'application/json',
		data: JSON.stringify({
			appId: config.appId,
			lastAmount:null,
			lastRareDegree:null,
			pageNo:1,
			pageSize:10,
			petIds:[],
			querySortType:"AMOUNT_ASC",
			requestId: timestamp(),
			tpl: config.tpl
		}),
		dataType: "json",
		success: function(data){
			if(data && data.data && data.data.petsOnSale){
				ret = data.data.petsOnSale;
			}
		}
	});

	return ret;
}

//筛选出满足条件的狗
function select(list,condition){
	var ret = list.filter(data => {
		if(data.rareDegree === condition.rareDegree && new Number(data.amount) <= condition.amount){
			return true;
		}
		return false;
	});

	return ret;
}

function go1(data){

	cache().setJson('data',data);

	window.location = 'https://pet-chain.baidu.com/chain/detail?channel=market&petId=' + data.petId + '&appId=' + config.appId + '&tpl=' + config.tpl + '&validCode=' + data.validCode;
}

var degree = ['普通','稀有','卓越','史诗','神话','传说'];

//购买
function purchase(data){

	$(function(){
		console.log('购买:',data.id,degree[data.rareDegree],data.amount);
		var e1 = jQuery.Event( "click");
		$('.button').trigger(e1);
		
		//回车提交
		// var e2 = jQuery.Event( "keyup", { keyCode: 13} );
	});
}

function solve(condition){
	var time = condition.time;
	var count = 0;
	var cb = function(){
		if(config.isStop){
			return;
		}
		//防止前进、后退到购买页面还在刷
		if(document.location.href.indexOf('pet-chain.baidu.com/chain/detail') > 0){
			return;
		}

		count++;
		console.log('第' + count + '次刷新');
		var list = select(getList(),condition);
		if(list && list.length > 0){
			go1(list[0]);
			return;
		}
		setTimeout(cb,time);
	};

	setTimeout(cb,time);
}

// function init(){

// 	if(document.location.href.indexOf('pet-chain.baidu.com/chain/detail') === -1){
// 		cache().rmFlag();
// 	}else{
// 		cache().setFlag();
// 	}

// 	if(!cache().isFlag()){
// 		console.log('开刷...');
// 		solve({
// 			time: 1500,//间隔时间
// 			rareDegree: 1, //级别：['普通','稀有','卓越','史诗','神话','传说'];
// 			amount: 1000//最大金额
// 		});
// 	}else{
// 		console.log('购买...');
// 		purchase(cache().getJson('data'));
// 	}
// }

// 向页面注入JS
function injectCustomJs(jsPath){
	jsPath = jsPath || 'js/inject.js';
	var temp = document.createElement('script');
	temp.setAttribute('type', 'text/javascript');
	// 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
	temp.src = chrome.extension.getURL(jsPath);
	temp.onload = function()
	{
		// 放在页面不好看，执行完后移除掉
		this.parentNode.removeChild(this);
	};
	document.body.appendChild(temp);
}

console.log('----',chrome.extension.getURL('js/inject.js'))
loadScript(chrome.extension.getURL('js/inject.js'));
loadScript('https://code.jquery.com/jquery-3.3.1.min.js');
// loadScript('https://code.jquery.com/jquery-3.3.1.min.js',init);

// if (window.history && window.history.pushState) {
// 	$(window).on('popstate', function () {
// 		init();
// 	});
// }

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){

	var data = JSON.parse(request);

	if('solve' === data.call){
		config.isStop = false;
		console.log('开刷...',data.rareDegree,data.amount,data.time);
		solve({
			time: data.time,//间隔时间
			rareDegree: data.rareDegree, //级别：['普通','稀有','卓越','史诗','神话','传说'];
			amount: data.amount//最大金额
		});
	}else if('stop' === data.call){
		config.isStop = true;
		console.log('停止...',);
	}
	

	//通知popup.js成功
	sendResponse('success');
});

