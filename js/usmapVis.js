var colorScale = d3.scale.linear().domain([ 30, 60, 90 ])
.range(colorbrewer.Blues[3])


function drawStates(usStateData, metaData) {
	var projection = d3.geo.albersUsa()
	var path = d3.geo.path().projection(projection);

	console.log(metaData);
	d3.select("#states")
			.selectAll("path")
			.data(topojson.feature(metaData, metaData.objects.states).features)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("fill", function(d) {
				console.log(d.properties.STATE + ":" + colorScale(usStateData[parseInt(d.properties.STATE)]));
			return colorScale(usStateData[d.properties.STATE]);
	});
	
	console.log(usStateData);
}

var usmap_this;
function usmapVis (_parentElement, _data, _metaData) {

    var self = this;
    usmap_this = this;

    self.parentElement = _parentElement;
    self.data = _data;
    self.metaData = _metaData;
    self.displayData = [];

    self.initVis();
}

usmapVis.prototype.initVis = function () {
    var self = this;
    drawStates(self.data, self.metaData)

};
