var colorScale = d3.scale.linear().domain([ 30, 60, 90 ])
.range(colorbrewer.Blues[3])


function drawCountries(countriesData, metaData) {
	var projection = d3.geo.mercator();
	var path = d3.geo.path().projection(projection);

	console.log(metaData);
	d3.select("#countries")
			.selectAll("path")
			.data(topojson.feature(metaData, metaData.objects.countries).features)
			.enter()
			.append("path")
			.attr("d", path);
			/*.attr("fill", function(d) {
				console.log(d.properties.STATE + ":" + colorScale(countriesData[parseInt(d.properties.STATE)]));
			return colorScale(countriesData[d.properties.STATE]);
	});*/
	
	console.log(countriesData);
}

var countriesmap_this;
function countryMapVis (_parentElement, _data, _metaData) {

    var self = this;
    countriesmap_this = this;

    self.parentElement = _parentElement;
    self.data = _data;
    self.metaData = _metaData;
    self.displayData = [];

    self.initVis();
}

countryMapVis.prototype.initVis = function () {
    var self = this;
    drawCountries(self.data, self.metaData)

};
