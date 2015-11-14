
var usSectorBar_this;
function usSectorBarChartVis (_parentElement, _data, _metaData) {

    var self = this;
    usSectorBar_this = this;

    self.parentElement = _parentElement;
    self.data = _data;
    self.metaData = _metaData;

    self.initVis();
}


usSectorBarChartVis.prototype.initVis = function () {
    var self = this; // read about the this

    self.svg = self.parentElement.select("svg");

    self.graphW = 500;
    self.graphH = 300;

    self.xScale = d3.scale.ordinal().rangeBands([0, self.graphW], 0.1).domain(d3.range(0, self.data));

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
        .attr("x", 10) // magic number
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start")
        .text(function (d) {
            return d;
    });

    self.visG.append("g").attr("class", "yAxis axis");

    self.updateVis();
};


/**
 * the drawing function - should use the D3 selection, enter, exit
 */
usSectorBarChartVis.prototype.updateVis = function () {


    var self = this;

    // update the scales :
    var minMaxY = [0, d3.max(self.data)];
    self.yScale.domain(minMaxY);
    self.yAxis.scale(self.yScale);

    // draw the scales :
    self.visG.select(".yAxis").call(self.yAxis);
    
    // draw the bars :
    var bars = self.visG.selectAll(".bar").data(self.data);
    bars.exit().remove();
    bars.enter().append("rect")
        .attr({
            "class": "bar",
            "width": self.xScale.rangeBand(),
            "x": function (d, i) {
                return self.xScale(i);
            }
        });

    bars.attr({
        "height": function (d, i) {
            return self.graphH - self.yScale(d[i]) - 1;
        },
        "y": function (d) {
            return self.yScale(d);
        }
    });
};


function makeBars() {
  var names = [],
      ids = [],
      name_values = [],
      values = [],
      chart,
      width = 400,
      bar_height = 20,
      height = (bar_height + 2 * gap) * names.length;
  
  var total_categories = 0, categories_count = 0;
  Object.keys(name_id_map).forEach(function(n) {
    if (valueById.get(+name_id_map[n])) {
      ids.push(+name_id_map[n]);
      values.push(valueById.get(+name_id_map[n]));
      name_values.push({name: n, value: valueById.get(+name_id_map[n])});
      total_categories += valueById.get(+name_id_map[n]);
      categories_count++;
    }
  });
  
  values.push(Math.round(total_categories / categories_count));
  name_values.push({name: AVG_CATEGORY, value: Math.round(total_categories / categories_count)});
  
  values = values.sort(function(a, b) {
    return -(a - b);
  });
  
  name_values = name_values.sort(function(a, b) {
    return -(a.value - b.value);
  });
  
  name_values.forEach(function(d) {
    names.push(d.name);
  });

  var left_width = 150;
  
  var x = d3.scale.linear()
     .domain([0, d3.max(values)])
     .range([0, width]);
  
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("top");
 
  var gap = 2;
  // redefine y for adjusting the gap
  var y = d3.scale.ordinal()
    .domain(names)
    .rangeBands([0, (bar_height + 2 * gap) * names.length]);

  chart = d3.select("#canvas-svg")
    .append('svg')
    .attr('class', 'chart')
    .attr('width', left_width + width + 100)
    .attr('height', (bar_height + gap * 2) * names.length + 30)
    .append("g")
    .attr("transform", "translate(10, 20)");

  chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + left_width + ", 0)")
    .call(xAxis)
  .append("text")
    .attr("transform", "rotate(90) translate(10, " + (-width - 20) + ")")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "right")
    .text(MAP_VALUE);

  chart.selectAll(".tick").append("line")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", 0)
    .attr("y2", (bar_height + gap * 2) * names.length);

  chart.selectAll("rect")
    .data(name_values)
    .enter().append("rect")
    .attr("x", left_width)
    .attr("y", function(d) { return y(d.name) + gap; })
    .attr("name", function(d, i) {
      return d.name;
    })
    .attr("width", function(d, i) {
      return x(d.value);
    })
    .attr("height", bar_height)
    .style("fill", function(d) {
      var i = quantize(d.value);
      var color = colors[i].getColors();
      return "rgb(" + color.r + "," + color.g +
          "," + color.b + ")";
    })
    .attr("class", function(d) {
      if (d.name === MAIN_CATEGORY || d.name === AVG_CATEGORY) {
        return "main-category-bar";
      } else {
        return "category-bar";
      }
    });

  chart.selectAll("text.score")
    .data(name_values)
    .enter().append("text")
    .attr("x", function(d) { return x(d.value) + left_width; })
    .attr("y", function(d, i){ return y(d.name) + y.rangeBand()/2; } )
    .attr("dx", -5)
    .attr("dy", ".36em")
    .attr("text-anchor", "end")
    .attr('class', 'score')
    .text(function(d) {
      return d.value;
    });
 
  chart.selectAll("text.name")
    .data(name_values)
    .enter().append("text")
    .attr("x", left_width / 2)
    .attr("y", function(d, i){
      return y(d.name) + y.rangeBand()/2; } )
    .attr("dy", ".36em")
    .attr("text-anchor", "middle")
    .attr('class', function(d) {
      if (d.name === MAIN_CATEGORY || d.name === AVG_CATEGORY) {
        return "main-category-text";
      } else {
        return "";
      }
    })
    .text(function(d) {
      return d.name;
    });
}