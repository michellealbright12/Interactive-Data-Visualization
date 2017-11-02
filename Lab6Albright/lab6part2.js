// Lab 6, part 2 javascript
// [Michelle Albright]

//////////////////////////////////////////////////////////////////////
// global variables
//   there might be an argument for making the data and svg global
//   the following  make sense as globals if you think of them as "constants"
//   then it's handy to have at the top here, for updating

var Width = 500;      // of SVG
var Height = 300;     // of SVG
var Padding= 75;      // padding of graph from svg edges; leave room for labels
var Data = "Data/est14_ME.csv"    // the data to work with

//////////////////////////////////////////////////////////////////////
// functions

function initialize (data) {
  console.log("initialize");

  // make the SVG
  var svg = makeSVG();

  // make xScale and yScale
  var xScale = d3.scaleBand()
    .domain(d3.range(data.length))
    .range([0+Padding,Width-Padding])
    .paddingInner(0.05);
  var yScale = d3.scaleLinear()
    .domain([0, 
	     d3.max(data, 
		    function(d) {return parseInt(d.Count_Poverty)})
	    ])
    .range([Height-Padding,Padding]);

  // draw some bars
  makeAndLabelBars(svg,data,xScale,yScale);

  // make axes
  makeAxes(svg,data,xScale,yScale);
  
  //sort ascending or descending based on certain p element click
  var sortA = d3.select("p#a");
  sortA.on("click", function() {
          sortAscending(svg, data, xScale);
        });
  var sortD = d3.select("p#d");
  sortD.on("click", function() {
          sortDescending(svg, data, xScale);
        }); 
} // end initialize

// create the initial bars
function makeAndLabelBars (svg,dataset,xScale,yScale) {
  var barPadding = 1;     // distance between bars
  var blueScaling = .01;   // multiplier from data value to blue shade
  var labelYoffset = 0;  // distance from the top of the bar

  console.log("make and label bars");

  // draw the bars
  svg.selectAll("rect.county")  // added .county to ignore outside rect
    .data(dataset)
    .enter()
    .append("rect")
    .attr("class", "county")
    .attr("x", function(d, i) {
      return xScale(i);
    })
    .attr("y", function(d) {
      return yScale(parseInt(d.Count_Poverty));
    })
    .attr("width", (Width-2*Padding) / dataset.length - barPadding)
    .attr("height", function(d) {
      return Height - Padding -  yScale(parseInt(d.Count_Poverty));
    })
    .attr("fill", function(d) {
      return "rgb(0, 0, " + 
	Math.round(parseInt(d.Count_Poverty) * blueScaling) + ")";
    });

} // end makeAndLabelBars


// create the axes
function makeAxes (svg, dataset, xScale, yScale) {

  // make axes
  console.log("make axes");

  var xAxis = 
    d3.axisBottom(xScale)
    .tickFormat(function(d) { return dataset[d].County; });

  svg.append('g')
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (Height - Padding) + ")")
    .call(xAxis)
    .selectAll("text")
    .attr("transform", function(d) {
      // location of labels is totally hacked
      return "rotate(90), translate(" + 10 + ",-" + 13 + ")" 
    })
    .style("text-anchor", "start");

  var yAxis = 
    d3.axisLeft(yScale)
      .ticks(5);

  svg.append('g')
    .attr("class", "y axis")
    .attr("transform", "translate(" + (Padding) + ",0)")
    .call(yAxis);
} // end makeAxes


// create the SVG context and return it
function makeSVG () {

  // add svg element
  var svg = d3.select("body")
    .append("svg")
    .attr("width", Width)
    .attr("height", Height)
  ;

  // draw the border of the SVG area
  svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", Height)
    .attr("width", Width)
    .style("stroke", "black")
    .style("fill", "none")
    .style("stroke-width", 1);

  return svg
} // end makeSVG

function sortAscending(svg, dataset, xScale) {
  svg.selectAll("rect.county")
       .sort(function(a, b) {//sort rects
         return d3.ascending(parseInt(a.Count_Poverty), parseInt(b.Count_Poverty));
       })
       .attr("x", function(d, i) {
         return xScale(i);
       });
  //sort dataset based on Count_Poverty and save it in a var
  var sorted = dataset.sort(function(a, b) {
	 return d3.ascending(parseInt(a.Count_Poverty), parseInt(b.Count_Poverty));
  });
  //format x-axis ticks based on new dataset sort
  var xAxis =
    d3.axisBottom(xScale)
    .tickFormat(function(d, i) { return dataset[i].County; });
  
  svg.select(".x.axis")
     .call(xAxis);

}
function sortDescending(svg, dataset, xScale) {
  svg.selectAll("rect.county")
     .sort(function(a, b) { //sort rects
	return d3.descending(parseInt(a.Count_Poverty), parseInt(b.Count_Poverty));
     })
     .attr("x", function(d, i) {
        return xScale(i);
     });
  //sort dataset based on Count_Poverty and save it in a var
  var sorted = dataset.sort(function (a, b) {
	return d3.descending(parseInt(a.Count_Poverty), parseInt(b.Count_Poverty));
  });
  //format x-axis ticks based on new dataset sort
  var xAxis = d3.axisBottom(xScale)
                .tickFormat(function(d, i) { return dataset[i].County; });
  
  svg.select(".x.axis")
     .call(xAxis);
}
//////////////////////////////////////////////////////////////////////
// read 
// the data file and setup the visualization
d3.csv(Data, function(error, data) {
    // error checking
    if (error) {
      console.log(error)
    }
    else {
      initialize(data)
    }
});
