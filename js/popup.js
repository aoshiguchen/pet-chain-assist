function log(info){
	$('#log').html(info);
}

function state(info){
	$('#state').html(info);
}

var isStop = false;

// 获取当前选项卡ID
function getCurrentTabId(callback){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}


// 向content-script主动发送消息
function sendMessageToContentScript(message, callback){
	getCurrentTabId((tabId) =>{
		chrome.tabs.sendMessage(tabId, message, function(response){
			if(callback) callback(response);
		});
	});
}

function start(){
	chrome.tabs.getSelected(null, function (tab) {
        if(tab.url && tab.url.indexOf('pet-chain.baidu.com/chain') > 0){
        	$('#btn').html('停止');
        	state('已开始...');
			var rareDegree = new Number($('#rareDegree').val());
			var amount = new Number($('#amount').val());
			var time = new Number($('#time').val());

			isStop = false;
			sendMessageToContentScript(JSON.stringify({
				call: 'solve',
				time: time,
				rareDegree: rareDegree,
				amount: amount
			}), (response) => {
				if(response){
					//消息发送失败
				}else{
					//消息发送成功
				}
			});
        }else{
        	state('请在莱次狗页面运行此插件!')
        	return;
        }
    });
}

function stop(){
	isStop = true;
	$('#btn').html('开刷');
	state('已停止...');
	sendMessageToContentScript(JSON.stringify({
		call: 'stop'
	}), (response) => {
		if(response){
			//消息发送失败
		}else{
			//消息发送成功
		}
	});
}

function init(){
	$('#btn').click(function(){
		var name = $('#btn').html();
		if(name === '开刷'){
			start();
		}else if(name === '停止'){
			stop();
		}
	});

	$('#open').click(function(){
		window.open('https://pet-chain.baidu.com/chain/dogMarket?appId=2');
	});
}

$(function() {

	init();

});