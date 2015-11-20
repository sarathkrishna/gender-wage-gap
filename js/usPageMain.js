
(
    function () {

    var statesMapVis;
    var lineCharVis;
    var stateWiseData = {};
    var metaData = {};
    function initVis() {
        
        statesMapVis = new usmapVis(d3.select("#map"), stateWiseData, metaData, null);
        lineCharVis = new usStatesLineChartVis(d3.select("#us-line-chart"), stateWiseData, metaData, null);
        // var statesBarVis = new
		// usStatesBarChartVis(d3.select("#us-states-bar-chart"), stateWiseData,
		// metaData, null);
        // var usSectorBarVis = new
		// usSectorBarChartVis(d3.select("#us-sector-bar-chart"), stateWiseData,
		// metaData, null);
                
    }

    function dataLoaded(error, usStateData, _metaData) {
        if (!error) {

            console.log(usStateData);
            for (var i = 0; i < usStateData.length; i++) {
            	var year = usStateData[i].Year;
            	delete usStateData[i].Year;
            	var keys = Object.keys(usStateData[i]);
            	var object = {};
            	for (var key of keys) {
            		object[key] = usStateData[i][key];
            	}
            	stateWiseData[year] = object;
            }
            console.log(stateWiseData);
            metaData = _metaData;

            initVis();
        }
    }

    function startHere() {
        queue()
            .defer(d3.csv, '../data/USStatewise.csv')
            .defer(d3.json, '../data/states.json')
            .await(dataLoaded);
        var slider = d3.slider().min(2011).max(2014).ticks(4).showRange(true).value(2011).callback(updateOnSliderChange);
        d3.select('#us-slider').call(slider);
        
    }
    
    function updateOnSliderChange(slider) {
    	var year = d3.format(".0f")(slider.value());
    	statesMapVis.updateYear(year);
    }
    
    startHere();
})();
