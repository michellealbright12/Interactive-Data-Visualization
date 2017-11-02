// Javascript for the last example in Murray, Chapter 9
//edited by Michelle Albright; Lab 5

//global variables
var w = 600;
var h = 250;
var max = 50;
var min = 2;
var colorScale = 10;

var dataset = [ { key: 0, value: 5 },  //dataset is now an array of objects.
		{ key: 1, value: 10 }, //Each object has a 'key' and a 'value'.
		{ key: 2, value: 13 },
		{ key: 3, value: 19 },
		{ key: 4, value: 21 },
		{ key: 5, value: 25 },
		{ key: 6, value: 22 },
		{ key: 7, value: 18 },
		{ key: 8, value: 15 },
		{ key: 9, value: 13 },
		{ key: 10, value: 11 },
		{ key: 11, value: 12 },
		{ key: 12, value: 15 },
		{ key: 13, value: 20 },
		{ key: 14, value: 18 },
		{ key: 15, value: 17 },
		{ key: 16, value: 16 },
		{ key: 17, value: 18 },
		{ key: 18, value: 23 },
		{ key: 19, value: 25 } ];

var xScale = d3.scaleBand()
  .domain(d3.range(dataset.length))
  .rangeRound([0, w])
  .paddingInner(0.05);

var yScale = d3.scaleLinear()
  .domain([0, d3.max(dataset, function(d) { return d.value; })])
  .range([0, h]);

//Define key function, to be used when binding data
//  1. Murray's way of binding anonymous function to a variable
var key = function(d) {
  return d.key;
};

// 2. The way that you and I would define the same function
function key (d) {
  return d.key;
}

//Create SVG element
var svg = d3.select("body")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

//Create bars
svg.selectAll("rect")
  .data(dataset, key)
  .enter()
  .append("rect")
  .attr("x", function(d, i) { //define bar attributes
    return xScale(i);
  })
  .attr("y", function(d) {
    return h - yScale(d.value);
  })
  .attr("width", xScale.bandwidth())
  .attr("height", function(d) {
    return yScale(d.value);
  })
  .attr("fill", function(d) {
    return "rgb(0, 0, " + (d.value * colorScale) + ")";
  });

//Create labels
svg.selectAll("text")
  .data(dataset, key)
  .enter()
  .append("text") 
  .text(function(d) { //define label attributes
    return d.value;
  })
  .attr("text-anchor", "middle")
  .attr("x", function(d, i) {
    return xScale(i) + xScale.bandwidth() / 2;
  })
  .attr("y", function(d) {
    return h - yScale(d.value) + 14;
  })
  .attr("font-family", "sans-serif")
  .attr("font-size", "11px")
  .attr("fill", "white");

//On click, update with new data                  
d3.selectAll("p")
  .on("click", function() {

    //See which p was clicked
    var paragraphID = d3.select(this).attr("id");
    
    //Decide what to do next
    if (paragraphID == "add") {
      //Add a data value
      var newNumber = Math.floor(Math.random() * (max-min)) + min;
      var lastKeyValue = dataset[dataset.length - 1].key;
      dataset.push({
	key: lastKeyValue + 1,
	value: newNumber
      });
    } else {
      //Remove a value
      dataset.shift();  //Remove one value from dataset
    }
    
    //Update scales
    xScale = d3.scaleBand()
               .domain(d3.range(dataset.length))
               .rangeRound([0, w])
               .paddingInner(0.05);

    yScale = d3.scaleLinear()
               .domain([0, d3.max(dataset, function(d) { return d.value; })])
               .range([0, h]);
    //Select bars
    var bars = svg.selectAll("rect")
      .data(dataset, key);
    
    //Enter
    bars.enter()
      .append("rect")
      .merge(bars)      //Update
      .attr("x", function(d, i) { //define new bar attributes
	return xScale(i);
      })
      .attr("y", function(d) {
	return h - yScale(d.value);
      })
      .attr("width", xScale.bandwidth())
      .attr("height", function(d) {
	return yScale(d.value);
      })
      .attr("fill", function(d) {
        return "rgb(0, 0, " + (d.value * colorScale) + ")";
      });

    //Exit & remove a bar
    bars.exit()
      .remove();

    //Select
    var labels = svg.selectAll("text")
      .data(dataset, key);

    //Exit
    labels.exit()
      .remove();
    
    //Enter
    labels.enter()
      .append("text")
      .merge(labels)    //Update
      .attr("x", function(d, i) { //define attributes
	return xScale(i) + xScale.bandwidth() / 2;
      })
      .text(function(d) {
        return d.value;
      })
      .attr("text-anchor", "middle")
      .attr("y", function(d) {
        return h - yScale(d.value) + 14;
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "11px")
      .attr("fill", "white");

  });

