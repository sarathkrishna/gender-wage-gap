
(
    function () {

    var countryWiseData = {};
    var metaData = {};

    function initVis() {
       
        var worldMapVis = new countryMapVis(d3.select("#map"), countryWiseData, metaData, null);
                
    }

    function dataLoaded(error, countriesData, _metaData) {
        if (!error) {

            console.log(countriesData);
            for (var i = 0; i < countriesData.length; i++) {
                countryWiseData[parseInt(countriesData[i].Id)] = countriesData[i].data;
            }
            metaData = _metaData;

            initVis();
        }
    }

    function startHere() {
        queue()
            .defer(d3.csv, '../data/USStatewise_2011.csv')
            .defer(d3.json, '../data/countries.json')
            .await(dataLoaded);
        
    }
    
    startHere();
})();
