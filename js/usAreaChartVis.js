var usAreaChart_this;
/**
 * This file is used for the creation of area chart in the US page.
 */
/**
 * Constructor
 */
function usAreaChartVis(_parentElement, _data) {
	var self = this;
	usAreaChart_this = this;

	self.parentElement = _parentElement;
	self.data = _data;
	self.initVis();
}

usAreaChartVis.prototype.initVis = function() {
	var self = this;

	self.chart = self.parentElement.select("svg");

	self.graphW = 1100;
	self.graphH = 500;
	self.margin = 30;
	self.yMinimum = 50;
	self.yMaximum = 100;
	self.lowestYear = 1979;
	var highestYear = 2015;
	var yTickWidth = 0.15;

	self.xScale = d3.scale.linear().domain([ self.lowestYear, highestYear ]).range(
			[ 0 + self.margin - 5, self.graphW ])

	self.yScale = d3.scale.linear().domain([ self.yMaximum, self.yMinimum ])
			.range([ 0 + self.margin, self.graphH - self.margin ]);

	self.xAxis = d3.svg.axis().scale(self.xScale).orient("bottom").ticks(37);

	self.yAxis = d3.svg.axis().scale(self.yScale).orient("left").ticks(9);

	self.visG = self.chart.append("g");

	// Draw the x Grid lines
	self.visG.append("g").attr("class", "grid").attr("transform",
			"translate(0," + 470 + ")").call(
			self.xAxis.tickSize(-self.graphH + 60, 0, 0).tickFormat(""))

	// Draw the y Grid lines
	self.visG.append("g").attr("class", "grid").attr("transform",
			"translate(20," + 0 + ")").call(
			self.yAxis.tickSize(-self.graphW + 20, 0, 0).tickFormat(""))

	self.visG.append("line").attr("x1", self.xScale(self.lowestYear)).attr("y1",
			self.yScale(self.yMinimum)).attr("x2", self.xScale(highestYear))
			.attr("y2", self.yScale(self.yMinimum)).attr("class", "axis");

	self.visG.append("svg:line").attr("x1", self.xScale(self.lowestYear)).attr("y1",
			self.yScale(self.yMinimum)).attr("x2", self.xScale(self.lowestYear))
			.attr("y2", self.yScale(self.yMaximum)).attr("class", "axis");

	//x labels
	self.visG.selectAll(".xLabel").data(
			self.xScale.ticks(highestYear - self.lowestYear + 1)).enter().append(
			"text").attr("class", "xLabel").text(String).attr("x", function(d) {
		return self.xScale(d)
	}).attr("y", self.graphH - 10).attr("text-anchor", "middle");

	//y labels
	self.visG.selectAll(".yLabel").data(self.yScale.ticks(9)).enter().append(
			"text").attr("class", "yLabel").text(String).attr("x",
			self.xScale(self.lowestYear) - 25).attr("y", function(d) {
		return self.yScale(d)
	}).attr("text-anchor", "right").attr("dy", 3)

	//xTicks
	self.visG.selectAll(".xTicks").data(
			self.xScale.ticks(highestYear - self.lowestYear + 1)).enter().append(
			"line").attr("class", "xTicks").attr("x1", function(d) {
		return self.xScale(d);
	}).attr("y1", self.yScale(self.yMinimum)).attr("x2", function(d) {
		return self.xScale(d);
	}).attr("y2", self.yScale(self.yMinimum) + 7);
	//yTicks
	self.visG.selectAll(".yTicks").data(self.yScale.ticks(9)).enter().append(
			"line").attr("class", "yTicks").attr("y1", function(d) {
		return self.yScale(d);
	}).attr("x1", self.xScale(self.lowestYear)).attr("y2", function(d) {
		return self.yScale(d);
	}).attr("x2", self.xScale(self.lowestYear - yTickWidth))

	self.updateVis();
};

usAreaChartVis.prototype.updateVis = function() {

	var self = this;

	self.body = d3.select('body');
	self.tooltip = self.body.append('div').attr('class', 'hidden tooltip');

	var line = d3.svg.area().x(function(d, i) {
		return self.xScale(d['Year']);
	}).y0(self.graphH - self.margin - 2).y1(function(d, i) {
		return self.yScale(d['Wage_Gap']);
	});

	self.visG.append("path").data([ self.data ]).attr("d", line).attr("class",
			"area").on("mousemove", self.onmousemove).on("mouseout",
			self.onmouseout);
};

/**
 * Done for tool-tips.
 * @param d
 * @param i
 */
usAreaChartVis.prototype.onmousemove = function(d, i) {
	var self = usAreaChart_this;
	var mouse = d3.mouse(self.body.node()).map(function(d) {
		return parseInt(d);
	});
	var year = self.xScale.invert(d3.mouse(this)[0]);
	year = d3.format(".0f")(year);
	console.log(year);
	var index = year - self.lowestYear;
	var value = d3.format(".2f")(d[index]['Wage_Gap']);
	self.tooltip.classed('hidden', false).attr('style',
			'left:' + (mouse[0] + 15) + 'px; top:' + (mouse[1] + 15) + 'px')
			.html(value + " in " + year);
}

usAreaChartVis.prototype.onmouseout = function(d, i) {
	var self = usAreaChart_this;
	self.tooltip.classed('hidden', true);
}