var line_this;
function lineChartVis(lineChartInfo) {

	var self = this;
	line_this = this;

	self.parentElement = lineChartInfo.parentElement;
	self.data = lineChartInfo.data;
	self.lineChartInfo = lineChartInfo;

	self.initVis();
}

lineChartVis.prototype.initVis = function() {
	var self = this;
	console.log(self.lineChartInfo);
	
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
			[ 0 + self.margin - 5, self.graphW ])

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
		// console.log(d);
		// console.log("x: "+ self.xScale(d['year']));
		return self.xScale(d['year']);
	}).y(function(d,i) {
		// console.log(self.yScale(d['val']));
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
			object[element].push(obj);
			object['element'] = element;
		}
	}
	// console.log(object);
	for (var element of elements) {
		var yearsObj = object[element];
		// console.log(yearsObj);
		// console.log(elementObj[yearObj]);
		self.visG.append("path")
			.data([yearsObj])
			.attr("d", line)
			.attr("class", "line")
			.on("mouseover", self.onmouseOver)
			.on("mouseout", self.onmouseOut);
	}
};

lineChartVis.prototype.onmouseOver = function (d, i) {
	var currClass = d3.select(this).attr("class");
	d3.select(this).attr("class", currClass + " current");
	console.log(this);
}
lineChartVis.prototype.onmouseOut = function(d, i) {
	var currClass = d3.select(this).attr("class");
	var prevClass = currClass.substring(0, currClass.length - 8);
	d3.select(this).attr("class", prevClass);
}