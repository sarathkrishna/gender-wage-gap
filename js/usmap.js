var colorScale = d3.scale.linear().domain([ 30, 60, 90 ])
.range(colorbrewer.Blues[3])

var wageGapData = {};
function addToMap(localWageGapData) {
	console.log(localWageGapData);
	for (var i = 0; i < localWageGapData.length; i++) {
		wageGapData[parseInt(localWageGapData[i].Id)] = localWageGapData[i].data;
	}
}

function drawStates(usStateData) {
	var projection = d3.geo.albersUsa()
	var path = d3.geo.path().projection(projection);

	console.log(usStateData);
	d3.select("#states")
	.selectAll("path")
	.data(topojson.feature(usStateData, usStateData.objects.states).features)
	.enter()
	.append("path")
	.attr("d", path)
	.attr("fill", function(d) {
		console.log(d.properties.STATE + ":" + colorScale(wageGapData[parseInt(d.properties.STATE)]));
		return colorScale(wageGapData[d.properties.STATE]);
	});
	
	console.log(usStateData);
}

d3.json("data/states.json", function(error, usStateData) {
	if (error)
		throw error;
	d3.csv("data/USStatewise_2011.csv", function(error1, wageGapData) {
		if (error1)
			throw error1;
		addToMap(wageGapData);
		drawStates(usStateData);
	});
});