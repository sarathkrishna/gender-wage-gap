
var worldBar_this;
function worldBarChartVis (_parentElement, _data, _idWorldMap, _metaData) {

    var self = this;
    worldBar_this = this;

    self.parentElement = _parentElement;
    self.data = _data;
    self.idWorldMap = _idWorldMap;
    self.metaData = _metaData;

    self.initVis();
}



worldBarChartVis.prototype.initVis = function () {
    var self = this; // read about the this

    self.svg = self.parentElement.select("svg");

    self.graphW = 800;
    self.graphH = 300;

    self.xScale = d3.scale.ordinal().rangeBands([0, self.graphW], 0.1).domain(d3.range(0, 50));

    self.yScale = d3.scale.linear().range([self.graphH, 0]);

    self.xAxis = d3.svg.axis().scale(self.xScale);

    self.yAxis = d3.svg.axis().scale(self.yScale).orient("left");

    self.visG = self.svg.append("g").attr({
        "transform": "translate(" + 60 + "," + 10 + ")"
    });

    self.visG.append("g")
        .attr("class", "xAxis axis")
        .attr("transform", "translate(0," + self.graphH + ")")
        .call(self.xAxis)
        .selectAll("text")
        .attr("y", 3) // magic number
        .attr("x", 5) // magic number
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start")
        .text(function (d) {
            return self.idWorldMap[d];
    });

    self.visG.append("g").attr("class", "yAxis axis");

    self.updateVis(2013);
};


/**
 * the drawing function - should use the D3 selection, enter, exit
 */
worldBarChartVis.prototype.updateVis = function (selectedYear) {

    var self = this;

    dataForYear = self.data[selectedYear];
    console.log(dataForYear);
    var sortedKeys = [];
    for(var key in dataForYear) sortedKeys.push(key);
    sortedKeys.sort( function(a, b) { return dataForYear[b] - dataForYear[a] } );

    var sortedValues = [];
    for (var i = 0; i < sortedKeys.length; i++)
      sortedValues.push(dataForYear[sortedKeys[i]]);

    console.log(sortedKeys);
    console.log(sortedValues);

    // update the scales :
    var minMaxY = [0, 100];
    self.yScale.domain(minMaxY);
    self.yAxis.scale(self.yScale);

    // draw the scales :
    self.visG.select(".yAxis").call(self.yAxis);

    
    // draw the bars :
    var bars = self.visG.selectAll(".bar").data(sortedKeys);
    bars.exit().remove();
    bars.enter().append("rect")
        .attr({
            "class": "bar",
            "width": self.xScale.rangeBand(),
            "x": function (d, i) {
                return self.xScale(i);
            }
        }).style({
            "fill": "#4E95C7"
        });

    bars.attr({
        "height": function (d, i) {
            return self.graphH - self.yScale(dataForYear[d]) - 1;
        },
        "y": function (d) {
            return self.yScale(dataForYear[d]);
        }
    });

    self.visG.select(".xAxis").data(sortedKeys)
        .attr("transform", "translate(0," + self.graphH + ")")
        .call(self.xAxis)
        .selectAll("text")
        .attr("y", 3) // magic number
        .attr("x", 5) // magic number
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start")
        .text(function (d) {
            return self.idWorldMap[sortedKeys[d]];
    });

};
