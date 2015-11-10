function addToMap(wageGapData) {
	
}

function drawStates(usStateData) {
	var projection = d3.geo.albersUsa()
	var path = d3.geo.path().projection(projection);

    d3.select("#states")
    	.selectAll("path")
        .data(topojson.feature(usStateData, usStateData.objects.states).features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class",function(d) {
        	console.log(d);
        	return "a";
        });
    console.log(usStateData);
}

d3.json("data/us.json", function (error, usStateData) {
    if (error) throw error;
    d3.json("data/data.json", function (error1, wageGapData) {
    	 if (error1) throw error1;
    	 addToMap(wageGapData);
    });
    drawStates(usStateData);
});