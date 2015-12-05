
// var colorScale = d3.scale.linear().domain([30, 60, 90]).range(colorbrewer.Blues[3]);

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

var COLOR_FIRST = "#9bbcdf", COLOR_LAST = "#08306B";

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

var usStatesBar_this;
function usStatesBarChartVis (_parentElement, _data, _idStateMap, _outerUpdateSelectedState) {

    var self = this;
    usStatesBar_this = this;

    self.parentElement = _parentElement;
    self.data = _data;
    self.idStateMap = _idStateMap;
    self.selectedYear = 2014;
    self.selectedState = 'none';
    self.outerUpdateSelectedState = _outerUpdateSelectedState;
    self.initVis();
}


usStatesBarChartVis.prototype.initVis = function () {
    var self = this; // read about the this

    self.svg = self.parentElement.select("svg");

    self.left_width = 5;
    self.bar_height = 14;
    self.width = 250;
    self.gap = 0.05;
    self.height = (self.bar_height + 2 * self.gap) * 51;

    self.x = d3.scale.linear()
        .domain([0, 100])
        .range([0, self.width]);
  
    self.xAxis = d3.svg.axis()
        .scale(self.x)
        .orient("top");
 
    self.chart = self.svg.attr('class', 'chart')
        .attr('width', self.left_width + self.width + 50)
        .attr('height', (self.bar_height + self.gap * 2) * 51 + 30)
        .append("g")
        .attr("transform", "translate(10, 20)");

    self.initialUpdate = 1;
    self.updateVis();
};

usStatesBarChartVis.prototype.updateYear = function (selectedYear) {
    console.log("usStatesBarChartVis.prototype.updateYear");
    var self = this;
    self.selectedYear = selectedYear;
    self.updateVis();
}

usStatesBarChartVis.prototype.updateState = function (selectedState) {
    var self = this;
    self.selectedState = selectedState;
    self.updateVis();
}


usStatesBarChartVis.prototype.updateVis = function () {
    var self = this;

    dataForYear = self.data[self.selectedYear];

    var sortedKeys = [];
    for(var key in dataForYear) sortedKeys.push(key);
    sortedKeys.sort( function(a, b) { return dataForYear[b] - dataForYear[a] } );

    var minKey = sortedKeys[0];
    var maxKey = sortedKeys[sortedKeys.length - 1];

    var sortedValues = [];
    for (var i = 0; i < sortedKeys.length; i++)
      sortedValues.push({name: i, value: dataForYear[sortedKeys[i]], state: self.idStateMap[sortedKeys[i]].split(" ").join("-")});

    var sortedNames = [];
    for (var i = 0; i < sortedKeys.length; i++)
        sortedNames.push(self.idStateMap[sortedKeys[i]]);

    var quantize = d3.scale.quantize()
        .domain([dataForYear[maxKey], dataForYear[minKey]])
        .range(d3.range(9).map(function(i) { return i }));

    var y = d3.scale.ordinal()
        .domain(sortedNames)
        .rangeBands([0, (self.bar_height + 2 * self.gap) * sortedNames.length]);

    self.chart.selectAll("rect").remove();
    self.chart.selectAll("text").remove();


    self.chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + self.left_width + ", 0)")
        .call(self.xAxis)
        .append("text")
        .attr("transform", "rotate(90) translate(10, " + (-self.width - 20) + ")")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "right");

    self.chart.selectAll(".tick").append("line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", (self.bar_height + self.gap * 2) * 51);

    var chart_bar = self.chart.selectAll("rect").data(sortedValues);

    chart_bar.enter().append("rect")
        .attr("x", self.left_width)
        .attr("y", function(d) { return y(sortedNames[d.name]) + self.gap; })
        .attr("name", function(d, i) { return d.name; })
        .attr("width", function(d, i) { return self.x(d.value); })
        .attr("height", self.bar_height)
        .style("fill", function(d) {
            var realcolor;
            if (d.state == self.selectedState) {
                realcolor = "#B00000";
            } else if (d.state == "United-States") {
                realcolor = "#834c24";
            } else {
                var i = quantize(d.value);
                var color = colors[i].getColors();
                realcolor = "rgb(" + color.r + "," + color.g + "," + color.b + ")";
            }
            return realcolor; 
        }).attr("class", function(d) { return "category-bar"; })
        .on('mouseover', function(d) {
            if (d.state == self.selectedState) {
                d3.select(this).style("fill", "#B00000");   
            } else {
                d3.select(this).style("fill", "#E86850");
            }
        }).on('mouseout', function(d) {
            var realcolor;
            if (d.state == self.selectedState) {
                realcolor = "#B00000";
            } else if (d.state == "United-States") {
                realcolor = "#834c24";
            } else {
                var i = quantize(d.value);
                var color = colors[i].getColors();
                realcolor = "rgb(" + color.r + "," + color.g + "," + color.b + ")";
            }
            d3.select(this).style("fill", realcolor);

        }).on('click', function(d) {
            self.outerUpdateSelectedState(d.state);
            d3.event.stopPropagation();
        });


    var chart_score = self.chart.selectAll("text.score").data(sortedValues);

    chart_score.enter().append("text")
        .attr("x", function(d) { return self.x(d.value) + self.left_width; })
        .attr("y", function(d, i){ return y(sortedNames[d.name]) + y.rangeBand()/2; } )
        .attr("dx", -5)
        .attr("dy", ".36em")
        .attr("text-anchor", "end")
        .attr('class', 'score')
        .text(function(d) { return d.value; });

    var chart_names = self.chart.selectAll("text.name").data(sortedValues);

    chart_names.enter().append("text")
        .attr("x", self.left_width/0.8)
        .attr("y", function(d, i){
            return y(sortedNames[d.name]) + y.rangeBand()/2; } )
        .attr("dy", ".36em")
        .attr("text-anchor", "begin")
        .attr('class', function(d) { return "state-name"; })
        .text(function(d) { return sortedNames[d.name]; });

  
};
