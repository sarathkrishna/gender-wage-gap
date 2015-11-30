var colorScale = d3.scale.linear().domain([ 30, 60, 90 ]).range(
		colorbrewer.Blues[3]);

var selectedYear = 2011;

function drawCountries(countriesData, metaData) {
	var projection = d3.geo.mercator().scale(70);
	var path = d3.geo.path().projection(projection);
	var body = d3.select('body');
	var tooltip = body.append('div').attr('class', 'hidden tooltip');
	// console.log(metaData);
	d3.select("#countries").selectAll("path").data(
			topojson.feature(metaData, metaData.objects.countries).features)
			.enter().append("path").attr("d", path).on(
					'mousemove',
					function(d) {
						var mouse = d3.mouse(body.node()).map(function(d) {
							return parseInt(d);
						});
						tooltip.classed('hidden', false).attr(
								'style',
								'left:' + (mouse[0] + 15) + 'px; top:'
										+ (mouse[1] + 50) + 'px').html(
								d.properties.name + ", " + (countriesData[selectedYear][d.properties.name]?countriesData[selectedYear][d.properties.name]:"-"));
					}).on('mouseout', function() {
				tooltip.classed('hidden', true);
			});
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
	if (year != selectedYear) {
		selectedYear = year;
		updateData(self.data);
	}
}
