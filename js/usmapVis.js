var colorScale = d3.scale.linear().domain([ 30, 60, 90 ]).range(
		colorbrewer.Blues[3])
var selectedYear = 2011;

function drawStates(usStateData, metaData) {
	var projection = d3.geo.albersUsa().scale(600);
	var path = d3.geo.path().projection(projection);
	var body = d3.select('body');
	var tooltip = body.append('div').attr('class', 'hidden tooltip');
	d3.select("#states").selectAll("path").data(
			topojson.feature(metaData, metaData.objects.states).features)
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
								d.properties.NAME + ", " + usStateData[selectedYear][d.properties.NAME]);
					}).on('mouseout', function() {
				tooltip.classed('hidden', true);
			});
	updateData(usStateData);
}

function updateData(usStateData) {
	d3.select("#states").selectAll("path").attr("fill", function(d) {
		var val = usStateData[selectedYear][d.properties.NAME];
		// console.log(d.properties.NAME + ":" + val);
		if (isNaN(val)) {
			return "#C0C0C0";
		} else {
			return colorScale(val);
		}
	});
}

var usmap_this;
function usmapVis(_parentElement, _data, _metaData) {

	var self = this;
	usmap_this = this;

	self.parentElement = _parentElement;
	self.data = _data;
	self.metaData = _metaData;
	self.displayData = [];
	selectedYear = 2011;
	self.initVis();
}

usmapVis.prototype.initVis = function() {
	var self = this;
	drawStates(self.data, self.metaData)

};

usmapVis.prototype.updateYear = function(year) {
	var self = this;
	if (year != selectedYear) {
		selectedYear = year;
		updateData(self.data);
	}
}
