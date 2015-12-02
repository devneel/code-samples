
var chart = c3.generate({
    bindto:"#deaths_by_country_donut",
    data: {
        json: donutData.countryDeathsForChart,
        keys: {
            value : donutData.countriesForAxisLabels
        },
        type : 'donut',
        onclick: function (d, i) { console.log("onclick", d, i); },
        onmouseover: function (d, i) { console.log("onmouseover", d, i); },
        onmouseout: function (d, i) { console.log("onmouseout", d, i); }
    },
    donut: {
        title: "Deaths By Country",
        label: {
            format: function (value, ratio, id) {
                return d3.format('%')(ratio);
            },
        },
    },
    tooltip : {
        format: {
            value: function (value, ratio, id, index) { return d3.format(',')(value) + ' Deaths'; }
        }
    }
    
});