
(
    function () {

    var yearToCountriesData = {};
    var metaData = {};
    var worldMapVis;
    
    function initVis() {
       
        worldMapVis = new countryMapVis(d3.select("#map"), yearToCountriesData, metaData, null);
        //var worldBarVis = new worldBarChartVis(d3.select("#world-states-bar-chart"), stateWiseData, metaData, null);
        //var worldSectorBarVis = new worldSectorBarChartVis(d3.select("#world-sector-bar-chart"), stateWiseData, metaData, null);
                
    }

    function dataLoaded(error, countriesData, _metaData) {
        if (!error) {
            for (var i = 0; i < countriesData.length; i++) {
            	var year = countriesData[i].Year;
            	delete countriesData[i].Year;
            	var keys = Object.keys(countriesData[i]);
            	var object = {};
            	for (var key of keys) {
            		object[key] = countriesData[i][key];
            	}
            	yearToCountriesData[year] = object;
            }
            //console.log(yearToCountriesData);
            metaData = _metaData;

            initVis();
        }
    }

    function startHere() {
        queue()
            .defer(d3.csv, '../data/OECD_Data.csv')
            .defer(d3.json, '../data/countries.json')
            .await(dataLoaded);
        var slider = d3.slider().min(1979).max(2013).ticks(26).showRange(true).value(2013).callback(updateOnSliderChange);
        d3.select('#world-slider').call(slider); 
    }
    
    function updateOnSliderChange(slider) {
    	var year = d3.format(".0f")(slider.value());
    	worldMapVis.updateYear(year);
    }
    
    startHere();
})();
