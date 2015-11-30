
(
    function () {

    var statesMapVis;
    var lineChartVis;
    var stateWiseData = {};
    var sectorWiseData = {};
    var mapData = {};
    var idStateMap = {};
    var stateIdMap = {};
    var statesBarVis;

    function initVis() {
        
        statesMapVis = new usmapVis(d3.select("#map"), stateWiseData, mapData, null);

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

        statesBarVis = new usStatesBarChartVis(d3.select("#us-states-bar-chart"), stateWiseDataWithID, idStateMap, mapData, null);
        // var usSectorBarVis = new
		// usSectorBarChartVis(d3.select("#us-sector-bar-chart"), stateWiseData,
		// mapData, null);
        var stateLineChartVis = new usStatesLineChartVis(d3.select("#us-state-line-chart"), stateWiseData, mapData, null);
        var sectorLineChartVis = new usSectorLineChartVis(d3.select("#us-sector-line-chart"), sectorWiseData, mapData, null);
    }

    function stateDataLoaded(error, usStateData, _mapData, usSectorData) {
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
            //console.log(stateWiseData);
            // console.log(usSectorData);
            for (var i = 0; i < usSectorData.length; i++) {
            	var year = usSectorData[i].Year;
            	delete usSectorData[i].Year;
            	var keys = Object.keys(usSectorData[i]);
            	var object = {};

                for (var key of keys) {
                    object[key] = usSectorData[i][key];
                }
            	sectorWiseData[year] = object;
            }
            // console.log(sectorWiseData);
            mapData = _mapData;

            initVis();
        }
    }

    function startHere() {
        queue()
            .defer(d3.csv, '../data/USStatewise.csv')
            .defer(d3.json, '../data/states.json')
            .defer(d3.csv, '../data/sectors.csv')
            .await(stateDataLoaded);
        var slider = d3.slider().min(2011).max(2014).ticks(4).showRange(true).value(2011).callback(updateOnSliderChange);
        d3.select('#us-slider').call(slider);
    }
    
    function updateOnSliderChange(slider) {
    	var year = d3.format(".0f")(slider.value());
    	statesMapVis.updateYear(year);
        statesBarVis.updateVis(year);
    }
    
    startHere();
})();
