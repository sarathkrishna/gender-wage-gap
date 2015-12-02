
(
    function () {

    d3.select("body").on("click", function() {
    	//updateSelectedState();
    	//updateSelectedSector();
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
    
    var selectedState;
    var selectedSector;
    
    function initVis() {
    	
        statesMapVis = new usmapVis(d3.select("#map"), stateWiseData, mapData, updateSelectedState);

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

        statesBarVis = new usStatesBarChartVis(d3.select("#us-states-bar-chart"), stateWiseDataWithID, idStateMap, null);

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
        
        usSectorBarVis = new usSectorBarChartVis(d3.select("#us-sector-bar-chart"), sectorWiseDataWithID, idSectorMap, null);


        var sectorLineChartInfo = getLineChartInfo("sector", d3.select("#us-sector-line-chart"), sectorWiseData, 800, 300, 30, 50, 100, 2011, 2014, 0.015);
        var stateLineChartInfo = getLineChartInfo("state", d3.select("#us-state-line-chart"), stateWiseData, 800, 300, 30, 60, 90, 2011, 2014, 0.015);
        
        sectorLineChartVis = new lineChartVis(sectorLineChartInfo);
        stateLineChartVis = new lineChartVis(stateLineChartInfo);
        
        var areaChartVis = new usAreaChartVis(d3.select("#us-area-chart"), usAggrData);
    }
    
    var statePrevPos;
    function updateSelectedState(state) {
    	var currPos = d3.mouse(d3.select("body").node());
    	if (statePrevPos && statePrevPos[0]==currPos[0] && statePrevPos[1]==currPos[1]) {
    		prevPos = currPos;
    		return;
    	}
    	prevPos = currPos;
    	console.log("Here! " + state);
    	selectedState = state;
    	statesMapVis.updateSelectedStateInMap(state);
    	stateLineChartVis.updateSelectedStateInLineChart(state);
    }
    
    var sectorPrevPos;
    function updateSelectedSector(sector) {
    	var currPos = d3.mouse(d3.select("body").node());
    	if (sectorPrevPos && sectorPrevPos[0]==currPos[0] && sectorPrevPos[1]==currPos[1]) {
    		sectorPrevPos = currPos;
    		return;
    	}
    	prevPos = currPos;
    	console.log("Here! " + sector);
    	selectedSector = sector;
    	sectorLineChartVis.updateSelectedSectorInLineChart(sector);
    }

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
    function stateDataLoaded(error, usStateData, _mapData, usSectorData, _usAggrData) {
        if (!error) {

            // console.log(usStateData);
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
            // console.log(stateWiseData);
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

    function startHere() {
        queue()
            .defer(d3.csv, '../data/USStatewise.csv')
            .defer(d3.json, '../data/states.json')
            .defer(d3.csv, '../data/sectors.csv')
            .defer(d3.csv, '../data/US_1979-2015.csv')
            .await(stateDataLoaded);
        var slider = d3.slider().min(2011).max(2014).ticks(4).showRange(true).value(2011).callback(updateOnSliderChange);
        d3.select('#us-slider').call(slider);
    }
    
    function updateOnSliderChange(slider) {
    	var year = d3.format(".0f")(slider.value());
    	statesMapVis.updateYear(year);
        statesBarVis.updateVis(year);
        usSectorBarVis.updateVis(year);
    }
    
    startHere();
})();
