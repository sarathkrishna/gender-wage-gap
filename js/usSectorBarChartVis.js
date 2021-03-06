/**
 * The JS that takes care of sector bar chart.
 * @param start
 * @param end
 * @param steps
 * @param count
 * @returns
 */

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

var usSectorBar_this;
/**
 * Constructor
 */
function usSectorBarChartVis (_parentElement, _data, _idSectorMap, _outerUpdateSelectedSector) {

    var self = this;
    usSectorBar_this = this;

    self.parentElement = _parentElement;
    self.data = _data;
    self.idSectorMap = _idSectorMap;
    self.selectedYear = 2014;
    self.selectedSector = "none";
    self.outerUpdateSelectedSector = _outerUpdateSelectedSector;

    self.initVis();
}


usSectorBarChartVis.prototype.initVis = function () {
    var self = this; // read about the this

    self.svg = self.parentElement.select("svg");

    self.left_width = 190;
    self.bar_height = 15;
    self.width = 250;
    self.gap = 1;
    self.height = (self.bar_height + 2 * self.gap) * 23;

    self.x = d3.scale.linear()
        .domain([0, 100])
        .range([0, self.width]);
  
    self.xAxis = d3.svg.axis()
        .scale(self.x)
        .orient("top");
 
    self.chart = self.svg.attr('class', 'chart')
        .attr('width', self.left_width + self.width + 50)
        .attr('height', (self.bar_height + self.gap * 2) * 23 + 30)
        .append("g")
        .attr("transform", "translate(10, 20)");

    self.updateVis();
};

/**
 * Function that handles year change.
 * @param selectedYear
 */
usSectorBarChartVis.prototype.updateYear = function (selectedYear) {
    var self = this;
    self.selectedYear = selectedYear;
    self.updateVis();
}

/**
 * Function that handles click select of sector.
 * @param selectedSector
 */
usSectorBarChartVis.prototype.updateSector = function (selectedSector) {
    var self = this;
    self.selectedSector = selectedSector;
    self.updateVis();
}

usSectorBarChartVis.prototype.updateVis = function () {

    var self = this;

    dataForYear = self.data[self.selectedYear];

    var sortedKeys = [];
    for(var key in dataForYear) sortedKeys.push(key);
    sortedKeys.sort( function(a, b) { return dataForYear[b] - dataForYear[a] } );

    var minKey = sortedKeys[0];
    var maxKey = sortedKeys[sortedKeys.length - 1];

    var sortedValues = [];
    for (var i = 0; i < sortedKeys.length; i++)
      sortedValues.push({name: i, value: dataForYear[sortedKeys[i]], 
    	  sector: self.idSectorMap[sortedKeys[i]].split('\&').join('-').split(" ").join("-").split(',').join('-')});

    var sortedNames = [];
    for (var i = 0; i < sortedKeys.length; i++)
        sortedNames.push(self.idSectorMap[sortedKeys[i]]);

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
        .attr("y2", (self.bar_height + self.gap * 2) * 23);


    var chart_bar = self.chart.selectAll("rect").data(sortedValues);
    chart_bar.enter().append("rect")
        .attr("x", self.left_width)
        .attr("y", function(d) { return y(sortedNames[d.name]) + self.gap; })
        .attr("name", function(d, i) {
            return d.name;
    })
    .attr("width", function(d, i) {
      return self.x(d.value);
    })
    .attr("height", self.bar_height)
    .style("fill", function(d) {
    if (d.sector == "United-States") {
        return "#834c24";
    } else if (d.sector == self.selectedSector) {
        return "#B00000";
    } else {
      var i = quantize(d.value);
      var color = colors[i].getColors();
      return "rgb(" + color.r + "," + color.g +
          "," + color.b + ")";
    }
    }).attr("class", function(d) {
        return "category-bar";
    }).on('mouseover', function(d) {
        if (d.sector == self.selectedSector) {
            d3.select(this).style("fill", "#B00000");   
        } else {
            d3.select(this).style("fill", "#E86850");
        }
    }).on('mouseout', function(d) {
        var realcolor;
        if (d.sector == self.selectedSector) {
            realcolor = "#B00000";
        } else if (d.sector == "United-States") {
            realcolor = "#834c24";
        } else {
            var i = quantize(d.value);
            var color = colors[i].getColors();
            realcolor = "rgb(" + color.r + "," + color.g + "," + color.b + ")";
        }
        d3.select(this).style("fill", realcolor);

    }).on('click', function(d) {
        self.outerUpdateSelectedSector(d.sector);
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
    .text(function(d) {
      return d.value;
    });
  
  var chart_names = self.chart.selectAll("text.name").data(sortedValues);

  chart_names.enter().append("text")
    .attr("x", self.left_width / 1.02)
    .attr("y", function(d, i){
      return y(sortedNames[d.name]) + y.rangeBand()/2; } )
    .attr("dy", ".36em")
    .attr("text-anchor", "end")
    .attr('class', function(d) {
        return "";
        })
    .text(function(d) {
      return sortedNames[d.name];
    });

};
