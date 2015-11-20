var colorScale = d3.scale.linear().domain([ 30, 60, 90 ]).range(
		colorbrewer.Blues[3]);

var selectedYear = 2011;

function drawCountries(countriesData, metaData) {
	var projection = d3.geo.mercator();
	var path = d3.geo.path().projection(projection);

	d3.select("#countries").selectAll("path").data(
			topojson.feature(metaData, metaData.objects.countries).features)
			.enter().append("path").attr("d", path);
	updateData(countriesData);
	//console.log(countriesData);
}

function updateData(countriesData) {
	d3.select("#countries").selectAll("path").attr("fill", function(d) {
		var val = countriesData[selectedYear][d.properties.name];
		if (!val) {
			return "#C0C0C0";
		} else {
			return colorScale(val);
		}
	});
}

var countriesmap_this;
function countryMapVis(_parentElement, _data, _metaData) {

	var self = this;
	countriesmap_this = this;

	self.parentElement = _parentElement;
	self.data = _data;
	self.metaData = _metaData;
	self.displayData = [];

	self.initVis();
}

countryMapVis.prototype.initVis = function() {
	var self = this;
	drawCountries(self.data, self.metaData)
};

countryMapVis.prototype.updateYear = function(year) {
	var self = this;
	console.log("Here! " + year);
	if (year != selectedYear) {
		selectedYear = year;
		updateData(self.data);
	}
}
