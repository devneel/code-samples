rp = 		require('request-promise')

// dataFeed.js - all data gathering related

// use request-promise (rp) to get the json feed from dronestre.am
exports.getDataFeed = function() {  
  var url = "http://api.dronestre.am/data";
  var options = {
    url: url,
    headers: { 'User-Agent': 'request' },
  };

  return rp(options).then(function(result) {
    var info = JSON.parse(result);
      return info.strike;
  })
};
