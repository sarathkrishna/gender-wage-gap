/**
 * The controller JS for US page.
 */
(
    function () {

    //Added to implement de-selection of selected state and sector.
    d3.select("body").on("click", function() {
    	updateSelectedState();
    	updateSelectedSector();
    });
    
    var statesMapVis;
    var stateWiseData = {};
    var sectorWiseData = {};
    var mapData = {};
    var idStateMap = {};
    var idSectorMap = {};
    var stateIdMap = {};
    var sectorIdMap = {};
    var statesBarVis;
    var usAggrData;
    var sectorLineChartVis;
    var stateLineChartVis;
    
    function initVis() {
    	
        statesMapVis = new usmapVis(d3.select("#map"), stateWiseData, mapData, updateSelectedState);

        //Data preparation for state bar chart
        var stateWiseDataWithID = {};
        var years = Object.keys(stateWiseData);
        for (var year of years) {
            var states = Object.keys(stateWiseData[year]);
            var object = {}
            for (var state of states) {
                object[stateIdMap[state]] = stateWiseData[year][state];
            }
            stateWiseDataWithID[year] = object;
        }

        statesBarVis = new usStatesBarChartVis(d3.select("#us-states-bar-chart"), stateWiseDataWithID, idStateMap, updateSelectedState, null);

        //Data preparation for sector bar chart
        var sectorWiseDataWithID = {};
        var years = Object.keys(sectorWiseData);
        for (var year of years) {
            var sectors = Object.keys(sectorWiseData[year]);
            var object = {}
            for (var sector of sectors) {
                object[sectorIdMap[sector]] = sectorWiseData[year][sector];
            }
            sectorWiseDataWithID[year] = object;
        }
        
        usSectorBarVis = new usSectorBarChartVis(d3.select("#us-sector-bar-chart"), sectorWiseDataWithID, idSectorMap, updateSelectedSector, null);


        var sectorLineChartInfo = getLineChartInfo("sector", d3.select("#us-sector-line-chart"), sectorWiseData, 500, 300, 30, 50, 100, 2011, 2014, 0.015);
        var stateLineChartInfo = getLineChartInfo("state", d3.select("#us-state-line-chart"), stateWiseData, 400, 300, 30, 60, 90, 2011, 2014, 0.015);
        
        sectorLineChartVis = new lineChartVis(sectorLineChartInfo);
        stateLineChartVis = new lineChartVis(stateLineChartInfo);
        
        var areaChartVis = new usAreaChartVis(d3.select("#us-area-chart"), usAggrData);
    }
    
    //The function called from other files for updating state selection
    function updateSelectedState(state) {
    	if (state) {
		 state = state.split(' ').join('-');
	    }
        statesBarVis.updateState(state);
    	statesMapVis.updateSelectedStateInMap(state);
    	stateLineChartVis.updateSelectedStateInLineChart(state);
    }
    
    //The function called from other files for updating sector selection
    function updateSelectedSector(sector) {
    	if (sector) {
    		sector = sector.split(' ').join('-').split('&').join('-').split(',').join('-');
   	    }
        usSectorBarVis.updateSector(sector);
    	sectorLineChartVis.updateSelectedSectorInLineChart(sector);
    }

    //To prepare the object to be used by lineChart.js for generating different line charts.
    function getLineChartInfo(type, parentElement, data, width, height, margin, yMinimum, yMaximum, lowestYear, highestYear, yTickWidth) {
    	var infoObject = {};
    	if (type == "state") {
    		infoObject.updateSelected = updateSelectedState;
    	} else if (type == "sector") {
    		infoObject.updateSelected = updateSelectedSector;
    	}
    	infoObject.type = type;
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
    	return infoObject;
    }
    /**
     * Function that will be called once all of the data has been loaded.
     * @param error
     * @param usStateData
     * @param _mapData
     * @param usSectorData
     * @param _usAggrData
     * @returns
     */
    function stateDataLoaded(error, usStateData, _mapData, usSectorData, _usAggrData) {
        if (!error) {

            for (var i = 0; i < usStateData.length; i++) {
            	var year = usStateData[i].Year;
            	delete usStateData[i].Year;
            	var keys = Object.keys(usStateData[i]);
            	var object = {};

                for (var key of keys) {
                    object[key] = usStateData[i][key];
                }
                if (i == 0) {
                   var stateId = 0;
                	for (var key of keys) {
                        idStateMap[stateId] = key;
                        stateIdMap[key] = stateId;
                        stateId = stateId + 1;
            	   }
                }
            	stateWiseData[year] = object;
            }

            for (var i = 0; i < usSectorData.length; i++) {
            	var year = usSectorData[i].Year;
            	delete usSectorData[i].Year;
            	var keys = Object.keys(usSectorData[i]);
            	var object = {};

                for (var key of keys) {
                    object[key] = usSectorData[i][key];
                }
                if (i == 0) {
                   var sectorId = 0;
                    for (var key of keys) {
                        idSectorMap[sectorId] = key;
                        sectorIdMap[key] = sectorId;
                        sectorId = sectorId + 1;
                   }
                }

            	sectorWiseData[year] = object;
            }
            mapData = _mapData;
            usAggrData = _usAggrData;

            initVis();
        }
    }

    /**
     * Function that takes care of loading data.
     * @returns
     */
    function startHere() {
        queue()
            .defer(d3.csv, 'data/USStatewise.csv')
            .defer(d3.json, 'data/states.json')
            .defer(d3.csv, 'data/sectors.csv')
            .defer(d3.csv, 'data/US_1979-2015.csv')
            .await(stateDataLoaded);
        //The slider that appears on the US page.
        var slider = d3.slider().min(2011).max(2014).ticks(4).showRange(true).value(2014).callback(updateOnSliderChange);
        d3.select('#us-slider').call(slider);
    }
    
    /**
     * Function that gets called when slider is moved.
     * @param slider
     * @returns
     */
    function updateOnSliderChange(slider) {
    	var year = d3.format(".0f")(slider.value());
    	statesMapVis.updateYear(year);
        statesBarVis.updateYear(year);
        usSectorBarVis.updateYear(year);
    }
    
    startHere();
})();


$('#nav-wrapper').height($("#nav").height());
$('#nav').affix({
    offset: { top: $('#nav').offset().top }
});