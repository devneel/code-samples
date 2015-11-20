'use strict';

var koa = 		require('koa'),
	router = 	require('koa-router')(),
	views = 	require('co-views'),
	marko = 	require('marko'),
	serve = 	require('koa-static'),
	compress = 	require('koa-compress'),
	request = 	require('koa-request')
	

var app = koa(); // initiate koa app

var render = views(__dirname + '/views/'); // our views will load from the /views directory


// By default, Koa Compress favors compression over streaming.
// We will use Z_SYNC_FLUSH to balance compression, buffering, and streaming
app.use(compress(
	{
		flush: require('zlib').Z_SYNC_FLUSH
	}
));

app.use(serve(__dirname + '/public')); // static files are served from /public directory


// router method to serve home page
router.get('/', function *() {

	 

	this.body = marko.load('./views/index.marko').stream();
	this.type = "text/html";
})

// router method to serve first visualization
router.get('/first', function *() {
	this.body =  marko.load('./views/first.marko').stream();
	this.type = "text/html"	
	// console.log('checkir');
 //    var options = {
 //        url: 'https://api.github.com/repos/dionoid/koa-request',
 //        headers: { 'User-Agent': 'request' }
 //    };
 // 	console.log("Options are " + options);
 //    var response = yield request(options); //Yay, HTTP requests with no callbacks! 
 //    var info = JSON.parse(response.body);
 //    console.log(info);
	 



})


app
  .use(router.routes())
  .use(router.allowedMethods());


app.listen(3000);