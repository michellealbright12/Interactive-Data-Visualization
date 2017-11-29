//JS file for FPs

//read in csv data

// Various accessors that specify the four dimensions of data to visualize.
function x(d) {

	return parseFloat(d.lake_area_ha); } //area in hectares
	function y(d) {

		return parseFloat(d.lake_area_ha);
}  //what are the units?
//function radius(d) { return d.land_development; }
function color(d) { return d.state_name; }
//function key(d) { return d.name; }

// Chart dimensions.
var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5},
width = 800 - margin.right,
height = 500 - margin.top - margin.bottom;
var xScale, yScale, xAxis, yAxis, svg;

function initScatter() {
	var svg = d3.select("body").select("div.scatterplot").append("svg")
				.attr("class", "scatter")
    			.attr("width", width + margin.left + margin.right)
    			.attr("height", height + margin.top + margin.bottom)
  				.append("g")
    			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	d3.csv("LagosDepthAreaSubset.csv", function(d) {
		//var data = d.filter( function(d) { (d.lake_area_ha != "NA") && (d.maxdepth != "NA");});
		xScale = d3.scaleLinear().domain([d3.min(d, function(d) {return parseFloat(d.lake_area_ha);}),
			d3.max(d, function(d) {return parseFloat(d.lake_area_ha);})]).range([margin.left, width]);
		yScale = d3.scaleLinear().domain([d3.min(d, function(d) {return parseFloat(d.lake_area_ha);}),
			d3.max(d, function(d) {return parseFloat(d.lake_area_ha);})]).range([height - margin.bottom, 0]);

		svg.selectAll("circle")
		   .data(d)
		   .enter()
		   .append("circle")
		   .attr("cx", function(d) { return xScale(x(d));})
		   .attr("cy", function(d) { return yScale(y(d));})
		   .attr("r", 2)
		   .attr("fill", "red");//function(d) {return color(d);});

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

function initHistogram() {

	var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

	d3.csv("LagosDepthAreaSubset.csv", function(error, data) {
  		if (error) throw error;
		var xScale = d3.scaleLinear().domain([d3.min(data, function(d) {return parseInt(d.totalpud);}),
			d3.max(data, function(d) {return parseInt(d.totalpud);})]).range([margin.left, width]);

		var yScale = d3.scaleLinear().range([height, 0]);

		var histogram = d3.histogram()
    				  .value(function(d) { return d.totalpud; })
    				  .domain(xScale.domain())
    				  .thresholds(15);
    				  //.thresholds(x.ticks(d3.timeWeek));

		var svg = d3.select("body").select("div.histo").append("svg")
				.attr("class", "histogram")
    			.attr("width", width + margin.left + margin.right)
    			.attr("height", height + margin.top + margin.bottom)
  				.append("g")
    			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("g")
    	.attr("class", "axis axis--x")
    	.attr("transform", "translate(0," + height + ")")
    	.call(d3.axisBottom(xScale));

  		var bins = histogram(data);

  		yScale.domain([0, d3.max(bins, function(d) { return d.length; })]);

  		var bar = svg.selectAll(".bar")
      				.data(bins)
    				.enter().append("g")
      				.attr("class", "bar")
     				.attr("transform", function(d) { return "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")"; });

  		bar.append("rect")
      	   .attr("x", 1)
      	   .attr("fill", "steelblue")
           .attr("width", function(d) { return xScale(d.x1) - xScale(d.x0) - 1; })
           .attr("height", function(d) { return height - yScale(d.length); });

  		bar.append("text")
           .attr("dy", ".75em")
           .attr("y", 6)
           .attr("x", function(d) { return (xScale(d.x1) - xScale(d.x0)) / 2; })
           .attr("text-anchor", "middle")
           .attr("fill", "white")
           .text(function(d) {
           		if (d.length == 0) {
           			return "";
           		} else {
           			return d.length;
           		}});
        // Add an x-axis label.
      	svg.append("text")
           .attr("class", "x label")
           .attr("text-anchor", "end")
           .attr("x", width/2)
           .attr("y", 5)
           .text("Total Photo User Days");

	});
}


function makeSVG() {
	var svg = d3.select("body").select("div.scatterplot")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	return svg;
}

initScatter();
initHistogram();
