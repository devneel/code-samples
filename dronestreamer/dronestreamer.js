'use strict';

var koa = 	require('koa'),
router = 	require('koa-router')(),
views = 	require('co-views'),
marko = 	require('marko'),
serve = 	require('koa-static'),
compress = 	require('koa-compress'),
rp = 		require('request-promise')



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


function getDataFeed() {
 
	var url = "http://api.dronestre.am/data";
	var options = {
		url: url,
		headers: { 'User-Agent': 'request' },
	};

	return rp(options).then(function(result) {
		var info = JSON.parse(result);
		return info.strike;
	});
};

function getCountryIndex(country_deaths, country){
	for(let j=0; j<country_deaths.length; j++){
		if( country_deaths[j].country==country) {
			return j;
		}
	}
	return -1;
}
function getDeathsByCountry(allStrikes) {
	var country_deaths = [];
	for(let i = 0; i < allStrikes.length; i++) {
		var strike = allStrikes[i];
		var deaths = parseInt(strike.deaths_max);
		deaths = isNaN(deaths) ? 0 : deaths;
		var index_of_country = getCountryIndex(country_deaths, strike.country);
		if ( index_of_country != -1) {
			country_deaths[index_of_country].deaths += deaths;
		} else {
			country_deaths.push({"country":strike.country, "deaths":deaths});
		}
	}
}


// router method to serve home page
router.get('/', function *() {
	this.body = marko.load('./views/index.marko').stream();
	this.type = "text/html";
})


// router method to serve first page
router.get('/deaths-by-country', function *() {
	
	var deathsByCountry = getDeathsByCountry(yield getDataFeed())

	this.body = marko.load('./views/deaths-by-country.marko').stream();
	this.type = "text/html";
})



// router method to serve raw data table
router.get('/table', function *() {


	let data = {
		strikes : getDataFeed()
	};

	this.body =  marko.load('./views/table.marko').stream(data);
	this.type = "text/html";
})






app
.use(router.routes())
.use(router.allowedMethods());


app.listen(3000);