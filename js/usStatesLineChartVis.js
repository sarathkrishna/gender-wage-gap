var usStatesLine_this;
function usStatesLineChartVis(_parentElement, _data, _metaData) {

	var self = this;
	usStatesLine_this = this;

	self.parentElement = _parentElement;
	self.data = _data;
	self.metaData = _metaData;

	self.initVis();
}

usStatesLineChartVis.prototype.initVis = function() {
	var self = this;

	self.chart = self.parentElement.select("svg");

	self.graphW = 800;
	self.graphH = 300;
	self.margin = 30;
	self.yMinimum = 60;
	self.yMaximum = 90;

	self.xScale = d3.scale.linear().domain([ 2011, 2014 ]).range(
			[ 0 + self.margin - 5, self.graphW ])

			self.yScale = d3.scale.linear().domain([ self.yMaximum, self.yMinimum]).range(
					[ 0 + self.margin, self.graphH - self.margin ]);

	self.xAxis = d3.svg.axis().scale(self.xScale);

	self.yAxis = d3.svg.axis().scale(self.yScale).orient("left");

	self.visG = self.chart.append("g");

	self.visG.append("line").attr("x1", self.xScale(2011)).attr("y1",
			self.yScale(self.yMinimum)).attr("x2", self.xScale(2014)).attr("y2",
					self.yScale(self.yMinimum)).attr("class", "axis");

	self.visG.append("svg:line").attr("x1", self.xScale(2011)).attr("y1",
			self.yScale(self.yMinimum)).attr("x2", self.xScale(2011)).attr("y2",
					self.yScale(self.yMaximum)).attr("class", "axis");

	self.visG.selectAll(".xLabel").data(self.xScale.ticks(4)).enter().append(
	"text").attr("class", "xLabel").text(String).attr("x", function(d) {
		return self.xScale(d)
	}).attr("y", self.graphH - 10).attr("text-anchor", "middle");

	self.visG.selectAll(".yLabel").data(self.yScale.ticks(9)).enter().append(
	"text").attr("class", "yLabel").text(String).attr("x", self.xScale(2011) - 25).attr("y",
			function(d) {
		return self.yScale(d)
	}).attr("text-anchor", "right").attr("dy", 3)

	self.visG.selectAll(".xTicks").data(self.xScale.ticks(4)).enter().append(
	"line").attr("class", "xTicks").attr("x1", function(d) {
		return self.xScale(d);
	}).attr("y1", self.yScale(self.yMinimum)).attr("x2", function(d) {
		return self.xScale(d);
	}).attr("y2", self.yScale(self.yMinimum) + 7)
	self.visG.selectAll(".yTicks").data(self.yScale.ticks(9)).enter().append(
	"line").attr("class", "yTicks").attr("y1", function(d) {
		return self.yScale(d);
	}).attr("x1", self.xScale(2011)).attr("y2", function(d) {
		return self.yScale(d);
	}).attr("x2", self.xScale(2010.979))

	self.updateVis();
};

usStatesLineChartVis.prototype.updateVis = function() {

	var self = this;
	var line = d3.svg.line().x(function(d, i) {
		console.log(d);
		return self.xScale(d['year']);
	}).y(function(d,i) {
		return self.yScale(d['val']);
	});

	var years = Object.keys(self.data);
	var object = {}
	var states;
	for (var year of years) {
		states = Object.keys(self.data[year]);
		for (var state of states) {
			if (!object[state]) {
				object[state] = [];
			}
			var obj = {};
			obj['year'] = year;
			obj['val'] = self.data[year][state];
			object[state].push(obj);
		}
	}
	console.log(object);
	for (var state of states) {
		var yearsObj = object[state];
		console.log(yearsObj);
		// console.log(stateObj[yearObj]);
		self.visG.append("path").data([yearsObj]).attr("d", line).attr("class","line").on("mouseover",onmouseover).on("mouseout",onmouseout);
	}
};

function onmouseover(d, i) {
	var currClass = d3.select(this).attr("class");
	d3.select(this).attr("class", currClass + " current");
	console.log(this);
/*	var countryCode = $(this).attr("country");
	var countryVals = startEnd[countryCode];
	var percentChange = 100 * (countryVals['endVal'] - countryVals['startVal'])
			/ countryVals['startVal'];
	var blurb = '<h2>' + countryCodes[countryCode] + '</h2>';
	blurb += "<p>On average: a life expectancy of "
			+ Math.round(countryVals['startVal']) + " years in "
			+ countryVals['startYear'] + " and "
			+ Math.round(countryVals['endVal']) + " years in "
			+ countryVals['endYear'] + ", ";
	if (percentChange >= 0) {
		blurb += "an increase of " + Math.round(percentChange) + " percent."
	} else {
		blurb += "a decrease of " + -1 * Math.round(percentChange)
				+ " percent."
	}
	blurb += "</p>";
	$("#default-blurb").hide();
	$("#blurb-content").html(blurb);*/
}
function onmouseout(d, i) {
	var currClass = d3.select(this).attr("class");
	var prevClass = currClass.substring(0, currClass.length - 8);
	d3.select(this).attr("class", prevClass);
	/*$("#default-blurb").show();
	$("#blurb-content").html('');*/
}