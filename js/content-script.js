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

      if(!val) return {};
      else return JSON.parse(val);
    },
    getTaskCache: function(){
    	return this.getJson('tackCache');
    },
    setTaskCache: function(data){
    	this.setJson('tackCache',data);
    }
  };
};

//获取时间戳
function timestamp(){
	var date = new Date();
	return date.getTime();
}

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
		log('购买:',data.id,degree[data.rareDegree],data.amount);
		var e1 = jQuery.Event( "click");
		$('.button').trigger(e1);
	});
}

function solve(condition){
	var time = condition.time;
	var count = getCount();
	var cb = function(){
		if(!isRun()){
			return;
		}
		//防止前进、后退到购买页面还在刷
		if(document.location.href.indexOf('pet-chain.baidu.com/chain/detail') > 0){
			return;
		}

		count++;
		writeTaskCache({
			count: count
		});
		log('第' + count + '次刷新');
		var list = select(getList(),condition);
		if(list && list.length > 0){
			go1(list[0]);
			return;
		}
		setTimeout(cb,time);
	};

	setTimeout(cb,time);
}

function writeTaskCache(json){
	var taskCache = cache().getTaskCache();

	for(var key in json){
		taskCache[key] = json[key];
	}

	cache().setTaskCache(taskCache);
}

function log(){
	var logInfo = Array.prototype.slice.apply(arguments);
	console.log.apply(null,logInfo);
	sendMessageToBackground({
		type: 'log',
		info: logInfo.join(',')
	});

	writeTaskCache({
		log: logInfo.join(',')
	});
}

function isRun(){
	var taskCache = cache().getTaskCache();

	return taskCache.isRun;
}

function getCount(){
	var taskCache = cache().getTaskCache();

	return taskCache.count || 0;
}

// 主动发送消息给后台
// 要演示此功能，请打开控制台主动执行sendMessageToBackground()
function sendMessageToBackground(message) {
	chrome.runtime.sendMessage({greeting: message});
} 

//接收消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){

	var data = JSON.parse(request);

	if('solve' === data.call){
		log('开刷...',data.rareDegree,data.amount,data.time);

		var condition = {
			isRun: true,
			count: 0,
			time: data.time,//间隔时间
			rareDegree: data.rareDegree, //级别：['普通','稀有','卓越','史诗','神话','传说'];
			amount: data.amount//最大金额
		};

		writeTaskCache(condition);

		solve(condition);
	}else if('stop' === data.call){
		writeTaskCache({
			isRun: false
		})
		log('停止...',);
	}else if('getCache' === data.call){
		console.log('获取缓存');
		sendResponse(cache().getTaskCache());
		return;
	}
	
	//通知popup.js成功
	sendResponse('success');
});

loadScript(chrome.extension.getURL('js/inject.js'),function(){
	loadScript('https://code.jquery.com/jquery-3.3.1.min.js',function(){
		console.log('脚本加载完成!');

		// sendMessageToBackground({
		// 	type: 'cache',
		// 	info: cache().getTaskCache()
		// });

		if(isRun()){
			console.log('继续上次运行...');
			var taskCache = cache().getTaskCache();
			solve(taskCache);
		}
	});
});
