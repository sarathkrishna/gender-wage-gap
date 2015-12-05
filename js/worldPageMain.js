
(
    function () {

	d3.select("body").on("click", function() {
		updateSelectedCountry();
    });
    	
    var yearToCountriesData = {};
    var metaData = {};
    var worldMapVis;
    var worldBarVis;
    var worldLineChartVis;
    var idCountryMap = {};
    var countryIdMap = {};

    function updateSelectedCountry(country) {
    	if (country) {
    		country = country.split(' ').join('-');
    	}
        worldBarVis.updateCountry(country);
        worldMapVis.updateSelectedCountryInMap(country);
        worldLineChartVis.updateSelectedCountryInLineChart(country);
    }

    
    function initVis() {
       
        worldMapVis = new countryMapVis(d3.select("#map"), yearToCountriesData, metaData, updateSelectedCountry);
        
        yearToCountriesDataWithID = {};
        years = Object.keys(yearToCountriesData);
        for (var year of years) {
            var object = {};
            countries = Object.keys(yearToCountriesData[year]);
            for (var country of countries) {
                object[countryIdMap[country]] = yearToCountriesData[year][country];
            }
            yearToCountriesDataWithID[year] = object;
        }
        worldBarVis = new worldBarChartVis(d3.select("#world-bar-chart"), yearToCountriesDataWithID, idCountryMap, updateSelectedCountry, null);

        var worldLineChartInfo = getLineChartInfo(d3.select("#world-line-chart"), yearToCountriesData, 1200, 500, 30, 50, 100, 1970, 2013, 0.21);
        
        
        worldLineChartVis = new lineChartVis(worldLineChartInfo);
    }

    function getLineChartInfo(parentElement, data, width, height, margin, yMinimum, yMaximum, lowestYear, highestYear, yTickWidth ) {
    	var infoObject = {};
    	infoObject.type = "country";
    	infoObject.parentElement = parentElement;
    	infoObject.data = data;
    	infoObject.width = width;
    	infoObject.height = height;
    	infoObject.margin = margin;
    	infoObject.yMinimum = yMinimum;
    	infoObject.yMaximum = yMaximum;
    	infoObject.lowestYear = lowestYear;
    	infoObject.highestYear = highestYear;
    	infoObject.yTickWidth = yTickWidth;
    	infoObject.updateSelected = updateSelectedCountry;
    	
    	return infoObject;
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
                if (i == 0) {
                    var count = 0;
                    for (var key of keys) {
                        idCountryMap[count] = key;
                        countryIdMap[key] = count;
                        count = count + 1;
                    }
                }
            	yearToCountriesData[year] = object;
            }
            // console.log(yearToCountriesData);
            metaData = _metaData;

            initVis();
        }
    }

    function startHere() {
        queue()
            .defer(d3.csv, 'data/OECD_Data.csv')
            .defer(d3.json, 'data/countries.json')
            .await(dataLoaded);
        var slider = d3.slider().min(1979).max(2013).ticks(26).showRange(true).value(2013).callback(updateOnSliderChange);
        d3.select('#world-slider').call(slider); 
    }
    
    function updateOnSliderChange(slider) {
    	var year = d3.format(".0f")(slider.value());
    	worldMapVis.updateYear(year);
        worldBarVis.updateYear(year);
    }
    
    startHere();
})();
