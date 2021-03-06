/**
 * The controller JS for US page.
 */
(
    function () {

    // Added to implement de-selection of selected country.
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

    
  // The function called from other files for updating country selection
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
        
        //data preparation for world bar chart.
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

    /**
     * For preparing object that is to be passed on to lineChartVis.js
     * @param parentElement
     * @param data
     * @param width
     * @param height
     * @param margin
     * @param yMinimum
     * @param yMaximum
     * @param lowestYear
     * @param highestYear
     * @param yTickWidth
     * @returns
     */
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
    /**
     * Function that will be called once all of the data has been loaded.
     * @param error
     * @param countriesData
     * @param _metaData
     * @returns
     */
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

    /**
     * Function that takes care of loading data.
     * @returns
     */
    function startHere() {
        queue()
            .defer(d3.csv, 'data/OECD_Data.csv')
            .defer(d3.json, 'data/countries.json')
            .await(dataLoaded);
        var slider = d3.slider().min(1970).max(2013).ticks(34).showRange(true).value(2013).callback(updateOnSliderChange);
        d3.select('#world-slider').call(slider); 
    }
    
    /**
     * Function that gets called when slider is moved.
     * @param slider
     * @returns
     */
    function updateOnSliderChange(slider) {
    	var year = d3.format(".0f")(slider.value());
    	worldMapVis.updateYear(year);
        worldBarVis.updateYear(year);
    }
    
    startHere();
})();



$('#nav-wrapper').height($("#nav").height());
$('#nav').affix({
    offset: { top: $('#nav').offset().top }
});

