'use strict';

var getDataFeed = require('./dataFeed.js')


// returns index of country in countryDeaths array, and -1 if country is not in array
function getCountryIndex(countryDeathsArray,country) {
  for(let i = 0; i < countryDeathsArray.length; i++) {
    if(countryDeathsArray[i].country == country) {
      return i; // found the country at index i, so return i
    } 
  }

  return -1; // didn't find the country in the array, so return -1
};



// ensures input is a number and returns 0 if not
function ensureNumber(number) {
  number = parseInt(number);
  return isNaN(number) ? 0 : number;
};


// get death count by country
function getDeathCountByCountry(allStrikes) {
  
  // dCBC (death count by country) object to store the countryDeaths and countriesForAxisLabels arrays
  var dCBC = {};

  // array to store countries and deaths
  var countryDeaths = [];

  // array to store formatted version of countryDeaths array for use in chart
  dCBC.countryDeathsForChart = [];

  // we'll put the countries in an array for use in the axis labels
  dCBC.countriesForAxisLabels = [];




  for(let i = 0; i < allStrikes.length; i++) {


    
    // get all info for this strike

    var strike = allStrikes[i];

    // get country from strike info
    var country = (strike.country).toString();
    
    // get number of deaths from strike info and make sure it is a number
    var numDeaths = ensureNumber(strike.deaths_max);
    // see if the country is already in our array, and if so, return the index. Otherwise, return -1
    var countryIndex = getCountryIndex(countryDeaths,country);


    // check if country's array already exists in our countryDeaths array
    // if the country already exists in the countryDeaths array, increment the death count
    // if not, push an array for the country

    if(countryIndex > -1) {
      // found the country in the array, so just increment its death count
      countryDeaths[countryIndex].deaths += numDeaths;
    } else {
      // didn't find the country in the array, so let's push it on
      countryDeaths.push({"country":country,"deaths":numDeaths});
    }
    // if this country doesn't exist in our countriesForAxisLabels array, then let's add it
    if(dCBC.countriesForAxisLabels.indexOf(country) === -1) {
      dCBC.countriesForAxisLabels.push(country);
    }
  }

  

  // Reformat data for the donut chart
  for(let i=0; i < countryDeaths.length; i++ ){
    var data_country = countryDeaths[i].country;
    var data_deaths = countryDeaths[i].deaths;
    dCBC.countryDeathsForChart.push({[data_country] : data_deaths});
  }

  return dCBC;
};

// returns array of breakdown of deaths by country
function getDeathsBreakdownByCountry(allStrikes) {
  var cd = {};
  cd.countryDeathsBreakdown = [];

  for(let i = 0; i < allStrikes.length; i++) {

    // get all info for this strike
    var strike = allStrikes[i];

    // get the country for this strike
    var country = strike.country;

    // get number of civ and child deaths from strike info
    var numCivDeaths = ensureNumber(strike.civilians);
    var numChildDeaths = ensureNumber(strike.children);
    var numMaxDeaths = ensureNumber(strike.deaths_max);
    var numOtherDeaths = numMaxDeaths - numCivDeaths - numChildDeaths;

    // if this country already exists in our array, let's return its index
    var countryIndex = getCountryIndex(cd.countryDeathsBreakdown,country);


    // if the country already exists in our array, increment its death counts
    if(countryIndex > -1) {
      cd.countryDeathsBreakdown[countryIndex].Civilians +=numCivDeaths;
      cd.countryDeathsBreakdown[countryIndex].Children +=numChildDeaths;
      cd.countryDeathsBreakdown[countryIndex].Other += numOtherDeaths;
    } else { // otherwise, add a new object for that country
      cd.countryDeathsBreakdown.push({
        "country" : country,
        "Civilians" : numCivDeaths, 
        "Children" : numChildDeaths,
        "Other" : numOtherDeaths
      });
    }
  }

  return cd;

};


// promise that returns deaths by country data (raw numbers, injuries/deaths breakdown)
exports.getDeathsByCountry = function() {
  return new Promise(function(resolve) {

    var deathsByCountry = {};

    var allStrikes = getDataFeed.getDataFeed() // first, get the json datafeed

    .then(function(allStrikes) { // next, find out the number of deaths per country
      deathsByCountry.deathCountByCountry = getDeathCountByCountry(allStrikes);

      return allStrikes;
    })
    .then(function(allStrikes) { //then, let's get the deaths breakdown by country (injuries, deaths, etc.)
      deathsByCountry.countryDeathsBreakdown = getDeathsBreakdownByCountry(allStrikes);

      return deathsByCountry;
    })
    .then(function(deathsByCountry) {
      resolve(deathsByCountry);
    })
    .catch(function(err) {
      throw err;
    })
  });
  
};
