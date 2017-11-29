// Various accessors that specify the four dimensions of data to visualize.
function x(d) { return parseFloat(d.secchi); }
function y(d) { return parseInt(d.no2); }
function radius(d) { return 2; }
function color(d) { return "red" ; }
function key(d) { return d.lagoslakeid; }

// Chart dimensions.
var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5},
    width = 960 - margin.right,
    height = 500 - margin.top - margin.bottom;

// Various scales. These domains make assumptions of data, naturally.
// Load the data.

/*****RIGHT NOW THE SCATTER PLOT WON'T WORK B/C THE CSV FILE IS ALL JANKY...
NEED TO FILL IN THE MISSING VALUES THAT RESULT FROM THE PYTHON SCRIPT******/
d3.csv("scatter_data.csv", function(nations) {

var minYear = d3.min(nations, function(d) {return parseInt(d.sampleyear);});
var maxYear = d3.max(nations, function(d) {return parseInt(d.sampleyear);});
var xScale = d3.scaleLinear().domain([d3.min(nations, function(d) {return parseFloat(d.secchi);}),
      d3.max(nations, function(d) {return parseFloat(d.secchi);})]).range([margin.left, width]);
var yScale = d3.scaleLinear().domain([d3.min(nations, function(d) {return parseInt(d.no2);}),
      d3.max(nations, function(d) {return parseInt(d.no2);})]).range([height - margin.bottom, 0]);

// The x & y axes.
var xAxis = d3.axisBottom().scale(xScale),
    yAxis = d3.axisLeft().scale(yScale);

// Create the SVG container and set the origin.
var svg = d3.select("#scatterplot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add the x-axis.
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    .call(xAxis);

// Add the y-axis.
svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + margin.left + ",0)")
    .call(yAxis);

// Add an x-axis label.
svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + 10)
    .text("Secchi Depth");

// Add a y-axis label.
svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", -10)
    .attr("x", 0)
    .attr("transform", "rotate(-90)")
    .text("NO2 levels, ppm");

// Add the year label; the value is set on transition.
var label = svg.append("text")
    .attr("class", "year label")
    .attr("text-anchor", "end")
    .attr("y", height - 24)
    .attr("x", width - 19.5)
    .text(minYear);

  // A bisector since many nation's data is sparsely-defined.
  var bisect = d3.bisector(function(d) { return d[0]; });

  // Add a dot per nation. Initialize the data at 1800, and set the colors.
  var dot = svg.append("g")
      .attr("class", "dots")
      .selectAll(".dot")
      .data(filterData(minYear))
      .enter().append("circle")
      .attr("class", "dot")
      .call(position);
      

  // Add a title.
  dot.append("title")
      .text(function(d) { return d.lagoslakeid; });

  var labelText = svg.select("text.year");

  // Add an overlay for the year label.
  var box = label.node().getBBox();

  var overlay = svg.append("rect")
        .attr("class", "overlay")
        .attr("x", box.x)
        .attr("y", box.y)
        .attr("width", box.width)
        .attr("height", box.height)
        .on("mouseover", enableInteraction);

  // Start a transition that interpolates the data based on year.
  svg.transition()
      .delay(1000)
      .duration(30000)
      .ease(d3.easeLinear)
      .tween("year", tweenYear)
      .on("end", enableInteraction);

  // Positions the dots based on data.
  function position(dot) {
     dot.attr("cx", function(d) { return xScale(x(d)); })
        .attr("cy", function(d) { return yScale(y(d)); })
        .attr("r", 4);
  }

  // Defines a sort order so that the smallest dots are drawn on top.
  function order(a, b) {
    return radius(b) - radius(a);
  }

  // After the transition finishes, you can mouseover to change the year.
  function enableInteraction() {
    var yearScale = d3.scaleLinear()
        .domain([minYear, maxYear])
        .range([box.x + 10, box.x + box.width - 10])
        .clamp(true);

    // Cancel the current transition, if any.
    svg.transition().duration(0);

    overlay
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
        .on("touchmove", mousemove);

    function mouseover() {
      label.classed("active", true);
    }

    function mouseout() {
      label.classed("active", false);
    }

    function mousemove() {
      displayYear(Math.round(yearScale.invert(d3.mouse(this)[0])));
    }
  }

  // Tweens the entire chart by first tweening the year, and then the data.
  // For the interpolated data, the dots and label are redrawn.
  function tweenYear() {
    var year = d3.interpolateNumber(minYear, maxYear);
    return function(t) { displayYear(Math.round(year(t))); };
  }

  // Updates the display to show the specified year.
  function displayYear(year) {
    var thesedots = svg.selectAll(".dot").data(filterData(year));

    thesedots.enter().append("circle")
       .attr("class", "dot")
       .attr("r", 4)
       .attr("cx", function(d) { return xScale(x(d)); })
       .attr("cy", function(d) { return yScale(y(d)); });
    thesedots.exit().remove();
     
    label.text(Math.round(year));
  }

  // filter the dataset for the given (fractional) year.
  function filterData(year) {
    var map = nations.map(function(d) {
      return {
        name: d.lagoslakeid,
        thisyear: parseInt(d.sampleyear),
        secchi: d.secchi,
        no2: d.no2, 
        nh4: d.nh4 
      };
    });
    var data = map.filter(function(d) {return parseInt(d.thisyear) == year;});
    return data;
  }

});
