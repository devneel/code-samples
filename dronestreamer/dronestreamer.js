'use strict';

var koa = 	require('koa'),
router = 	require('koa-router')(),
views = 	require('co-views'),
marko = 	require('marko'),
serve = 	require('koa-static'),
compress = 	require('koa-compress'),
less = 		require('koa-less'),
path = 		require('path'),


deathsByCountry = require('./controllers/deathsByCountry.js'),
dataFeed = 	require('./controllers/dataFeed.js')


var app = koa(); // initiate koa app


// look for less files in /styles, and output the compiled css to /public
app.use(less(path.join(__dirname, 'styles'), {
	dest: path.join(__dirname, 'public'),
	preprocess: {
		path: function(pathname, req) {
			return pathname.replace(path.sep + 'css' + path.sep, path.sep);
		}
	},


}));


app.use(serve('./public')); // static files are served from /public directory

var render = views(__dirname + '/views/'); // our views will load from the /views directory


// By default, Koa Compress favors compression over streaming.
// We will use Z_SYNC_FLUSH to balance compression, buffering, and streaming
app.use(compress(
{
	flush: require('zlib').Z_SYNC_FLUSH
}
));


// router method to serve home page
router.get('/', function *() {
	this.body = marko.load('./views/index.marko').stream();
	this.type = "text/html";
})


// router method to serve first page
router.get('/deaths-by-country', function *() {
	

	let data = deathsByCountry.getDeathsByCountry(); // has two arrays: deathCountByCountry and countryDeathsBreakdown

	this.body = marko.load('./views/deaths-by-country.marko').stream(data);
	this.type = "text/html";
})

// router method to serve raw data table
router.get('/table', function *() {


	let data = {
		strikes : dataFeed.getDataFeed()
	};



	this.body =  marko.load('./views/table.marko').stream(data);
	this.type = "text/html";
})


app
.use(router.routes())
.use(router.allowedMethods());


app.listen(3000);