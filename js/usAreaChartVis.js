var usAreaChart_this;
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
	var lowestYear = 1979;
	var highestYear = 2015;
	var yTickWidth = 0.15;

	self.xScale = d3.scale.linear().domain([ lowestYear, highestYear ]).range(
			[ 0 + self.margin - 5, self.graphW ])

	self.yScale = d3.scale.linear().domain([ self.yMaximum, self.yMinimum ])
			.range([ 0 + self.margin, self.graphH - self.margin ]);

	self.xAxis = d3.svg.axis().scale(self.xScale).orient("bottom").ticks(37);

	self.yAxis = d3.svg.axis().scale(self.yScale).orient("left").ticks(9);

	self.visG = self.chart.append("g");

	// Draw the x Grid lines
    self.visG.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + 470 + ")")
        .call(self.xAxis
            .tickSize(-self.graphH+60, 0, 0)
            .tickFormat("")
        )

    // Draw the y Grid lines
    self.visG.append("g")            
        .attr("class", "grid")
        .call(self.yAxis
            .tickSize(-self.graphW, 0, 0)
            .tickFormat("")
        )

	self.visG.append("line").attr("x1", self.xScale(lowestYear)).attr("y1",
			self.yScale(self.yMinimum)).attr("x2", self.xScale(highestYear))
			.attr("y2", self.yScale(self.yMinimum)).attr("class", "axis");

	self.visG.append("svg:line").attr("x1", self.xScale(lowestYear)).attr("y1",
			self.yScale(self.yMinimum)).attr("x2", self.xScale(lowestYear))
			.attr("y2", self.yScale(self.yMaximum)).attr("class", "axis");

	self.visG.selectAll(".xLabel").data(
			self.xScale.ticks(highestYear - lowestYear + 1)).enter().append(
			"text").attr("class", "xLabel").text(String).attr("x", function(d) {
		return self.xScale(d)
	}).attr("y", self.graphH - 10).attr("text-anchor", "middle");

	self.visG.selectAll(".yLabel").data(self.yScale.ticks(9)).enter().append(
			"text").attr("class", "yLabel").text(String).attr("x",
			self.xScale(lowestYear) - 25).attr("y", function(d) {
		return self.yScale(d)
	}).attr("text-anchor", "right").attr("dy", 3)

	self.visG.selectAll(".xTicks").data(
			self.xScale.ticks(highestYear - lowestYear + 1)).enter().append(
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

usAreaChartVis.prototype.updateVis = function() {

	var self = this;
	var line = d3.svg.area().x(function(d, i) {
		return self.xScale(d['Year']);
	}).y0(self.graphH - self.margin - 2).y1(function(d, i) {
		return self.yScale(d['Wage_Gap']);
	});

	self.visG.append("path").data([ self.data ]).attr("d", line).attr("class",
			"area");
};