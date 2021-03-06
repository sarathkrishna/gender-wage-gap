/**
 * This file is used for the creation of three line charts - US state line
 * chart, US sector line chart and OECD countries chart.
 */
var line_this;
/**
 * Constructor
 */
function lineChartVis(lineChartInfo) {

	var self = this;
	line_this = this;

	self.parentElement = lineChartInfo.parentElement;
	self.data = lineChartInfo.data;
	self.lineChartInfo = lineChartInfo;

	// For updating the other charts
	self.outerUpdateSelected = lineChartInfo.updateSelected; 
	self.initVis();
}

lineChartVis.prototype.initVis = function() {
	var self = this;
	
	self.chart = self.parentElement.select("svg");
	self.graphW = self.lineChartInfo.width;
	self.graphH = self.lineChartInfo.height;
	self.margin = self.lineChartInfo.margin;
	self.yMinimum = self.lineChartInfo.yMinimum;
	self.yMaximum = self.lineChartInfo.yMaximum;
	var lowestYear = self.lineChartInfo.lowestYear;
	var highestYear = self.lineChartInfo.highestYear;
	var yTickWidth = self.lineChartInfo.yTickWidth;
	

	self.xScale = d3.scale.linear().domain([ lowestYear, highestYear ]).range(
			[ 0 + self.margin - 5, self.graphW ]);

	self.yScale = d3.scale.linear().domain([ self.yMaximum, self.yMinimum]).range(
					[ 0 + self.margin, self.graphH - self.margin ]);

	self.xAxis = d3.svg.axis().scale(self.xScale);

	self.yAxis = d3.svg.axis().scale(self.yScale).orient("left");

	self.visG = self.chart.append("g");

	self.visG.append("line").attr("x1", self.xScale(lowestYear)).attr("y1",
			self.yScale(self.yMinimum)).attr("x2", self.xScale(highestYear)).attr("y2",
					self.yScale(self.yMinimum)).attr("class", "axis");

	self.visG.append("svg:line").attr("x1", self.xScale(lowestYear)).attr("y1",
			self.yScale(self.yMinimum)).attr("x2", self.xScale(lowestYear)).attr("y2",
					self.yScale(self.yMaximum)).attr("class", "axis");

	self.visG.selectAll(".xLabel").data(self.xScale.ticks(highestYear - lowestYear + 1)).enter().append(
	"text").attr("class", "xLabel").text(String).attr("x", function(d) {
		return self.xScale(d)
	}).attr("y", self.graphH - 10).attr("text-anchor", "middle");

	self.visG.selectAll(".yLabel").data(self.yScale.ticks(9)).enter().append(
	"text").attr("class", "yLabel").text(String).attr("x", self.xScale(lowestYear) - 25).attr("y",
			function(d) {
		return self.yScale(d)
	}).attr("text-anchor", "right").attr("dy", 3)

	self.visG.selectAll(".xTicks").data(self.xScale.ticks(highestYear - lowestYear + 1)).enter().append(
	"line").attr("class", "xTicks").attr("x1", function(d) {
		return self.xScale(d);
	}).attr("y1", self.yScale(self.yMinimum)).attr("x2", function(d) {
		return self.xScale(d);
	}).attr("y2", self.yScale(self.yMinimum) + 7);
	self.visG.selectAll(".yTicks").data(self.yScale.ticks(9)).enter().append(
	"line").attr("class", "yTicks").attr("y1", function(d) {
		return self.yScale(d);
	}).attr("x1", self.xScale(lowestYear)).attr("y2", function(d) {
		return self.yScale(d);
	}).attr("x2", self.xScale(lowestYear - yTickWidth))

	self.updateVis();
};

lineChartVis.prototype.updateVis = function() {

	var self = this;
	var line = d3.svg.line().x(function(d, i) {
		return self.xScale(d['year']);
	}).y(function(d,i) {
		return self.yScale(d['val']);
	});

	var years = Object.keys(self.data);
	var object = {}
	var elements;
	for (var year of years) {
		elements = Object.keys(self.data[year]);
		for (var element of elements) {
			if (!object[element]) {
				object[element] = [];
			}
			if (!self.data[year][element]) {
				continue;
			}
			var obj = {};
			obj['year'] = year;
			obj['val'] = self.data[year][element];
			obj['element'] = element;
			object[element].push(obj);
		}
	}
	self.body = d3.select('body');
	self.tooltip = self.body.append('div').attr('class', 'hidden tooltip');
	
	for (var element of elements) {
		var yearsObj = object[element];
		self.visG.append("path")
			.data([yearsObj])
			.attr("d", line)
			.attr("class", function (d) {
				// Following is done for highlighting US line
				if (element == "USA" || element == "United States") {
					// CSS classes do not support spaces (obviously!), hyphens
					// and ampersands.
					return "line USA " + self.lineChartInfo.type + "-" + element.split('&').join('-').split(' ').join('-');
				}
				return "line " + self.lineChartInfo.type + "-" + element.split('&').join('-').split(' ').join('-').split(',').join('-');
			})
			.on("mouseover", self.onmouseover)
			.on("mouseout", self.onmouseout)
			.on('mousemove',self.onmousemove)
			.on('click', function(d) {
					self.outerUpdateSelected(d[0]['element']);
					// So that clear selection won't catch this click.
					d3.event.stopPropagation();
			});
	}
};

lineChartVis.prototype.onmouseover = function (d, i) {
	// For hover effect
	var currClass = d3.select(this).attr("class");
	d3.select(this).classed("current", true);
}
lineChartVis.prototype.onmouseout = function(d, i) {
	var self = line_this;
	d3.select(this).classed("current", false);
	
	self.tooltip.classed('hidden', true);
}

lineChartVis.prototype.onmousemove = function(d,i) {
	// In world chart, missing information exists and hence the nearest data
	// value is displayed.
	var self = line_this;
	var mouse = d3.mouse(self.body.node()).map(function(d) {
		return parseInt(d);
	});
	var year = self.xScale.invert(d3.mouse(this)[0]);
	year = d3.format(".0f")(year);
	index = year - self.lineChartInfo.lowestYear;
	if(!d[index] || d[index]['year'] != year) {
		var diff = 10000; // magic number
		var calcYear = d[0]['year'];
		var i = -1;
		for(var object of d) {
			i++;
			var newDiff = year - object['year'];
			if (newDiff<0) {
				// To make the value positive, for comparison
				newDiff = -newDiff;
			}
			if (newDiff<diff) {
				diff = newDiff;
				calcYear = object['year'];
				index = i;
			}
		}
		year = calcYear;
	}
	self.tooltip.classed('hidden', false).attr(
			'style',
			'left:' + (mouse[0] + 15) + 'px; top:'
					+ (mouse[1] + 15) + 'px').html(
			d[index]['element'] + " in " +year + ": " + d[index]['val']);
}

/**
 * For state line chart.
 */
lineChartVis.prototype.updateSelectedStateInLineChart = function(state) {
	if (!state) {
		d3.select(".selected-state-line").classed("selected-state-line", false);
		return;
	}
	var sel = d3.select(".line.state-" + state);
	sel.moveToFront();
	d3.select(".selected-state-line").classed("selected-state-line", false);
	sel.classed("selected-state-line", true);
}

/**
 * For sector line chart.
 */
lineChartVis.prototype.updateSelectedSectorInLineChart = function(sector) {
	console.log(sector);
	if (!sector) {
		d3.select(".selected-sector-line").classed("selected-sector-line", false);
		return;
	}
	var sel = d3.select(".line.sector-" + sector);
	sel.moveToFront();
	d3.select(".selected-sector-line").classed("selected-sector-line", false);
	sel.classed("selected-sector-line", true);
}

/**
 * For country line chart.
 */
lineChartVis.prototype.updateSelectedCountryInLineChart = function(country) {
	if (!country) {
		d3.select(".selected-country-line").classed("selected-country-line", false);
		return;
	}
	var sel = d3.select(".line.country-" + country);
	sel.moveToFront();
	d3.select(".selected-country-line").classed("selected-country-line", false);
	sel.classed("selected-country-line", true);
}

/**
 * For moving the selected element to the front (in other words, make it the
 * last child of the parent).
 */
d3.selection.prototype.moveToFront = function() {
	  return this.each(function(){
	  this.parentNode.appendChild(this);
	  });
}