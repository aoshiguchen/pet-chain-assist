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

//获取时间戳
function timestamp(){
	var date = new Date();
	return date.getTime();
}

//获取验证码
function getAuthCode(){
	var ret;
	$.ajax({
		type: "POST",
		url: "https://pet-chain.baidu.com/data/captcha/gen",
		async: false,
		contentType: 'application/json',
		data: JSON.stringify({
			appId: config.appId,
			requestId: timestamp(),
			tpl: config.tpl
		}),
		dataType: "json",
		success: function(data){
			if(data && data.data && data.data.img){
				ret = 'data:image/png;base64,' + data.data.img;
			}
			// if(data && data.data){
			// 	ret =  data.data;
			// }
		}
	});

	return ret;
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

//创建订单
function create(data){
	var date = new Date();
	data.requestId = date.getTime();
	data.tpl = config.tpl;
	$.ajax({
		type: "POST",
		url: "https://pet-chain.baidu.com/data/txn/create",
		async: false,
		contentType: 'application/json',
		data: JSON.stringify(data),
		dataType: "json",
		success: function(data){
			console.log(data);
		}
	});
}

function go1(data){

	window.location = 'https://pet-chain.baidu.com/chain/detail?channel=market&petId=' + data.petId + '&appId=' + config.appId + '&tpl=' + config.tpl + '&validCode=' + data.validCode;
}

var degree = ['普通','稀有','卓越','史诗','神话','传说'];

//购买
function purchase(list){
	for(var i = 0; i < list.length; i++){
		log('购买:',list[i].id,degree[list[i].rareDegree],list[i].amount);
		// //获取验证码
		// var authcode = getAuthCode();
		// //识别验证码
		// var code = '';
		// //购买
		// create({
		// 	amount: list[i].amount,
		// 	appId:config.appId,
		// 	captcha:code,
		// 	petId:list[i].petId,
		// 	seed: authcode.seed,
		// 	validCode:list[i].validCode,
		// });
		go1(list[i]);
		return;
	}	
}

function solve(condition){
	var time = condition.time;
	var count = 0;
	var cb = function(){
		if(isStop){
			return;
		}
		var list = select(getList(),condition);
		if(list && list.length > 0){
			count++;
			log('第' + count + '次刷新,' + list.length + '条数据');
			purchase(list);
			return;
		}else{
			log('刷新失败!');
		}
		setTimeout(cb,time);
	};

	setTimeout(cb,time);
}



