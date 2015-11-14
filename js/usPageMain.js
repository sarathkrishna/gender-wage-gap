
(
    function () {

    var stateWiseData = {};
    var metaData = {};

    function initVis() {
        
        var statesMapVis = new usmapVis(d3.select("#map"), stateWiseData, metaData, null);
                
    }

    function dataLoaded(error, usStateData, _metaData) {
        if (!error) {

            console.log(usStateData);
            for (var i = 0; i < usStateData.length; i++) {
                stateWiseData[parseInt(usStateData[i].Id)] = usStateData[i].data;
            }
            metaData = _metaData;

            initVis();
        }
    }

    function startHere() {
        queue()
            .defer(d3.csv, '../data/USStatewise_2011.csv')
            .defer(d3.json, '../data/states.json')
            .await(dataLoaded);
        
    }
    
    startHere();
})();
