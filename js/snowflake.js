//雪花最多数量
var COUNT = 10;
//雪花最笑大小
var MIN_SIZE = 1;
//雪花最大大小
var MAX_SIZE = 5;
//雪花速度
var SPEED = 0.5;
//间隔时间
var TIME = 10;
//运行标志
var RUN_FLAG = false;

var PAGE_HEIGHT = window.innerHeight;
var PAGE_WIDTH = window.innerWidth;

var snowflakes = [];

function createSnowflake(){
	var div = $('<div>❄</div>');

	div.css('position','absolute');
	div.css('opacity',0.917736);
	div.css('color','red');

	return div;
}

//雪花降落
function land(snowflake){

	var cb = function(){
		if(!RUN_FLAG)return;

		var top = snowflake.offset().top - $(document).scrollTop();

		if(top > PAGE_HEIGHT){
			duang(snowflake);
			return;
		}

		snowflake.css('top',top + $(document).scrollTop() + SPEED + 'px');
		setTimeout(cb,TIME);
	};

	return cb;
}

//随机生成起点坐标，雪花大小
function duang(snowflake){
	var top = 0 - 1000 * Math.random();
	var left = (PAGE_WIDTH - 30) * Math.random() + 15;
	var fontSize = 6 + 60 * Math.random();
	var opacity = Math.random();

	snowflake.css('top',top + $(document).scrollTop() + 'px');
	snowflake.css('left',left + 'px');
	snowflake.css('font-size',fontSize + 'px');
	snowflake.css('opacity',opacity);

	land(snowflake)();
}

function start(){
	RUN_FLAG = true;
	$('#snowflake').html('停止下雪');
	for(var i = 0; i < COUNT; i++){
		(function(i){
			setTimeout(function(){
				duang(snowflakes[i]);
			},10000 * Math.random());
		})(i);
	}
}

function end(){
	RUN_FLAG = false;
	$('#snowflake').html('开始下雪');
	for(var i = 0; i < COUNT; i++){
		snowflake.css('top','-500px');
		snowflake.css('left','-1000px');
	}
}

$(function(){
	for(var i = 0; i < COUNT; i++){
		var snowflake = createSnowflake();
		// $(document.body).append(snowflake);
		snowflakes.push(snowflake);
	}

	$('#snowflake').click(function(){
		var name = $('#snowflake').html();
		if(name === '开始下雪'){
			start();
		}else if(name === '停止下雪'){
			end();
		}
	});

});