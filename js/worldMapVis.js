
function Interpolate(start, end, steps, count) {
    var s = start,
        e = end,
        final = s + (((e - s) / steps) * count);
    return Math.floor(final);
}

function Color(_r, _g, _b) {
    var r, g, b;
    var setColors = function(_r, _g, _b) {
        r = _r;
        g = _g;
        b = _b;
    };

    setColors(_r, _g, _b);
    this.getColors = function() {
        var colors = {
            r: r,
            g: g,
            b: b
        };
        return colors;
    };
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

var COLOR_FIRST = "#aeceee", COLOR_LAST = "#08306B";

var rgb = hexToRgb(COLOR_FIRST);
var COLOR_START = new Color(rgb.r, rgb.g, rgb.b);
var rgb = hexToRgb(COLOR_LAST);
var COLOR_END = new Color(rgb.r, rgb.g, rgb.b);

var startColors = COLOR_START.getColors(),
    endColors = COLOR_END.getColors();


var colors = [];

for (var i = 0; i < 9; i++) {
  var r = Interpolate(startColors.r, endColors.r, 9, i);
  var g = Interpolate(startColors.g, endColors.g, 9, i);
  var b = Interpolate(startColors.b, endColors.b, 9, i);
  colors.push(new Color(r, g, b));
}


var colorScale = d3.scale.linear().domain([ 30, 60, 90 ]).range(
		colorbrewer.Blues[3]);

var selectedYear = 2011;

function drawCountries(countriesData, metaData) {
	var width = 500;
	var height = 500;
	var projection = d3.geo.mercator().scale(70).translate([width / 2, height / 2]);
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

	year_values = [];
	for (var country in countriesData[selectedYear])
		year_values.push(countriesData[selectedYear][country]);

	var minValue = Math.min.apply(null, year_values);
	var maxValue = Math.max.apply(null, year_values);

	var quantize = d3.scale.quantize()
        .domain([minValue, maxValue])
        .range(d3.range(9).map(function(i) { return i }));


	d3.select("#countries").selectAll("path").attr("fill", function(d) {
		var val = countriesData[selectedYear][d.properties.name];
		if (!val) {
			return "#C0C0C0";
		} else {
			// return colorScale(val);

			var i = quantize(val);
      		var color = colors[i].getColors();
      		return "rgb(" + color.r + "," + color.g +
          		"," + color.b + ")";
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
