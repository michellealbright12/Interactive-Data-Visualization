//JS file for FPs

//read in csv data

// Various accessors that specify the four dimensions of data to visualize.
function x(d) {

	return parseFloat(d.secchi); 
  } //area in hectares
function y(d) {
		return parseFloat(d.no2);
}  //what are the units?
function radius(d) { return d.totalpud; }
function color(d) { return d.state_name; }
function key(d) { return d.lagoslakeid; }

// Chart dimensions.
var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5},
width = 800 - margin.right,
height = 500 - margin.top - margin.bottom;
var xScale, yScale, xAxis, yAxis, svg;
var bisect = d3.bisector(function(d) { return d[0]; });

function initScatter() {
	svg = makeSVG();

	d3.csv("scatter_data.csv", function(data) {
		xScale = d3.scaleLinear().domain([d3.min(data, function(d) {return parseFloat(d.secchi);}),
			d3.max(data, function(d) {return parseFloat(d.secchi);})]).range([margin.left, width]);
		yScale = d3.scaleLinear().domain([d3.min(data, function(d) {return parseFloat(d.no2);}),
			d3.max(data, function(d) {return parseFloat(d.no2);})]).range([height - margin.bottom, 0]);
    // Add the year label; the value is set on transition.
    var label = svg.append("text")
    .attr("class", "year label")
    .attr("text-anchor", "end")
    .attr("y", height - 24)
    .attr("x", width)
    .text("1800");

    var box = label.node().getBBox();

    var overlay = svg.append("rect")
        .attr("class", "overlay")
        .attr("x", box.x)
        .attr("y", box.y)
        .attr("width", box.width)
        .attr("height", box.height)
        .attr("fill", "none")
        .on("mouseover", enableInteraction(box, label));

    var circle = svg.append("g")
                    .attr("class", "circles")
                    .selectAll(".circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("class", "circle")
                    .attr("x", function(d) { return xScale(x(d)); })
                    .attr("y", function(d) { return yScale(y(d)); })
                    .attr("r", 3)
                    .style("fill", "red");
    svg.transition()
      .duration(500)
      .ease(d3.easeLinear)
      .tween("year", tweenYear(circle, data, label))
      .on("end", enableInteraction(box, label));

		xAxis = d3.axisBottom()
				  .scale(xScale);
		yAxis = d3.axisLeft()
				  .scale(yScale);
		svg.append("g")
		   .attr("class", "x axis")
		   .attr("transform", "translate(0," + (height - margin.bottom) + ")")
		   .call(xAxis);
		svg.append("g")
		   .attr("class", "y axis")
		   .attr("transform", "translate(" + margin.left + ",0)")
		   .call(yAxis);

        // Add an x-axis label.
      	svg.append("text")
           .attr("class", "x label")
           .attr("text-anchor", "end")
           .attr("x", width)
           .attr("y", height + 8)
           .text("Lake Area in Hectares");

		// Add a y-axis label.
		svg.append("text")
		   .attr("class", "y label")
		   .attr("text-anchor", "end")
		   .attr("y", 6)
		   .attr("x", -10)
		   .attr("transform", "rotate(-90)")
		   .text("Lake Depth");
    		//radiusScale = d3.scale.sqrt().domain([0, 5e8]).range([0, 40]),
    		//colorScale = d3.scale.category10();
    	});

}

function makeSVG() {
	var svg = d3.select("body").append("svg")
          //.attr("class", "scatter")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	return svg;
}


  // Defines a sort order so that the smallest dots are drawn on top.
  function order(a, b) {
    return radius(b) - radius(a);
  }

  // After the transition finishes, you can mouseover to change the year.
  function enableInteraction(box, label) {
    var yearScale = d3.scaleLinear()
        .domain([1800, 2009])
        .range([box.x + 10, box.x + box.width - 10])
        .clamp(true);

    // Cancel the current transition, if any.
    svg.transition().duration(0);
    var overlay = svg.select(".overlay");

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
      displayYear(dot, yearScale.invert(d3.mouse(this)[0], data));
    }
  }

  // Tweens the entire chart by first tweening the year, and then the data.
  // For the interpolated data, the dots and label are redrawn.
  function tweenYear(dot, data, label) {
    var year = d3.interpolateNumber(1800, 2009);
    return function(t) { displayYear(dot, year(t), data, label); };
  }

  // Updates the display to show the specified year.
  function displayYear(dot, year, data, label) {
    dot.data(interpolateData(year, data), key)
       .attr("x", function(d) { return xScale(x(d)); })
       .attr("y", function(d) { return yScale(y(d)); })
       .attr("r", 3)
       .sort(order);
    label.text(Math.round(year));
  }

  // Interpolates the dataset for the given (fractional) year.
  function interpolateData(year, data) {
    return data.map(function(d) {
      return {
        id: d.lagoslakeid,
        nh4: interpolateValues(d.nh4, year),
        secchi: d.secchi,
        no2: interpolateValues(d.no2, year),
        no2no3: interpolateValues(d.no2no3, year)
        
      };
    });
  }

  // Finds (and possibly interpolates) the value for the specified year.
  function interpolateValues(values, year) {
    var i = bisect.left(values, year, 0, values.length - 1),
        a = values[i];
    if (i > 0) {
      var b = values[i - 1],
          t = (year - a[0]) / (b[0] - a[0]);
      return a[1] * (1 - t) + b[1] * t;
    }
    return a[1];
  }
initScatter();
