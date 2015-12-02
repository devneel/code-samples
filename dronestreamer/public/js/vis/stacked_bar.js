var chart = c3.generate({
    bindto : "#deaths_breakdown_by_country_stacked_bar",
    data: {
        type : 'bar',
        json : stackedBarData.countryDeathsBreakdown,
        keys : {
            x : 'country',
            value : ['Civilians', 'Children', 'Other']
        },
        groups : [['Civilians', 'Children']]
    },
    axis: {
         x: {
            type: 'category'
         },
         y : {
            label : 'Number of Deaths'
         }
    },
    bar: {
        width: {
            ratio: 0.5
        }
    }
});

