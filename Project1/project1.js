
// Project 1 javascript
// [Michelle]

//////////////////////////////////////////////////////////////////////
// global variables
//   there might be an argument for making the data and svg global
//   the following  make sense as globals if you think of them as "constants"
//   then it's handy to have at the top here, for updating

var Width = 700;      // of SVG
var Height = 500;     // of SVG
var Padding= 125;      // padding of graph from svg edges; leave room for labels
var Data = "data.csv";    // the data to work with
var BlueScaling = .01;
var BarPadding = 1;
var myNS = {};
//////////////////////////////////////////////////////////////////////
// functions

function initialize (dataset) {
  console.log("initialize");
  /*********************/
  /*  Bar Graph Init   */
  /*********************/
  // make the SVG
  var svg = makeSVGBarChart();
  //take a subset of the very large dataset to graph
  var data = getSubset(dataset);
  // make xScale and yScale for the bar chart
  var xScale = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) {return parseInt(d.population)})])
    .range([Padding, Width]);
  var yScale = d3.scaleBand()
    .domain(data.map(function(d) {return d.communityname}))
    .range([Padding/2, Height-Padding]);
  // draw some bars
  makeAndLabelBars(svg,data,xScale,yScale);

  makeAxes(svg,data,xScale,yScale);

  //sort ascending or descending based on certain p element click
  sort(svg, data, xScale, yScale);

  //set up mouseover and mouseout events
  mouseOverAndOut(svg, xScale, yScale);

  /*********************/
  /*   Scatter Init    */
  /*********************/

  //set up scatter plot space
  createNamespace(data);
  //initialize the scatter plot
  var scatterSvg = createScatterPlotSVG();

  // create axes and scales to be held in scatter plot namespace
  createScales();
  createAxes();

  //draw the initial circles for the points, axes, and labels
  makeCircles(scatterSvg);
  makeAxesAndLabels(scatterSvg);

  //make the lengend
  makeLegend(scatterSvg);

  //set up on change functions for changing the data when dropdown vals change
  updateScatter(scatterSvg, data, myNS.xScale, myNS.yScale);
} // end initialize

/******************************************************/
// Begin Scatter Plot Functions
/******************************************************/

// return 0 if in first 3rd, 1 in 2nd third, or 2 for 3rd third
function getClass(datapoint) {
  var min = d3.min(myNS.dataset, function(d) { return +d[myNS.xData]; })
  var max = d3.max(myNS.dataset, function(d) { return +d[myNS.xData]; })

  if (+datapoint[myNS.xData] < (((max - min)/3) + min)) {
    return 0;
  } else if (+datapoint[myNS.xData] < (((2*(max - min)/3) + min))) {
    return 1;
  } else {
    return 2;
  }
} //end getClass

//make scatter plot menu and svg
function createScatterPlotSVG() {
  // make the meanu items for interactivity
  makeMenu();

  //build the svg element and append it to the body within the scatterPlot div
  var svg = d3.select("body")
    .select("div#scatterPlot")
    .append("svg")
    .attr("width", myNS.width)
    .attr("height", myNS.height);

  return svg;
} //end createScatterPlotSVG

// update scatter plot on changes to x or y dropdown menus
function updateScatter(svg, data, xScale, yScale) {
  var durationMils = 1000; //var for transition durations

  // update x values on change
  d3.select("#xSelect").on("change", function() {
    //set xData string to new value
    myNS.xData = this.value;
    createScales(); //re-create scales

    myNS.xAxis = d3.axisBottom(myNS.xScale).ticks(5); // reset x axis
    //re-draw axis
    svg.select(".x.axis")
      .transition()
      .duration(durationMils)
      .call(myNS.xAxis);

    //change the text label for the xaxis
    d3.select("text#xlabel")
      .transition()
      .duration(durationMils)
      .text(myNS.xData);
     
    svg.selectAll("text.legendText")
     .text(function(d) { 
      if (d == 0) {
        return ("Bottom third of " + myNS.xData); 
      }
      if (d == 1) {
        return ("Middle third of " + myNS.xData);
      }
      else
         return ("Top third of " + myNS.xData);
     })
    .style("font-size", "12px");
    //move all the circles to their new x locations
    svg.selectAll("circle")
      .data(data)
      .transition()
      .duration(durationMils)
      .attr("class", function(d) {
        return getClass(d);
      })
      .attr('fill', function(d) {
        return myNS.colorScale(getClass(d));
      })
      .attr("cx", function(d) {
        return myNS.xScale(+d[myNS.xData]);  ///
      });
  });

  // update y values on change
  d3.select("#ySelect").on("change", function() {
    //set yData string to new value
    myNS.yData = this.value;
    createScales(); //re-create scales

    myNS.yAxis = d3.axisLeft(myNS.yScale).ticks(5); //reset y axis
    //redraw y axis
    svg.select(".y.axis")
      .transition()
      .duration(durationMils)
      .call(myNS.yAxis);

    //change text label for yaxis
    d3.select("text#ylabel")
      .transition()
      .duration(durationMils)
      .text(myNS.yData);

    //move all the circles to their new y locations
    svg.selectAll("circle")
      .data(data)
      .transition()
      .duration(durationMils)
      .attr("class", function(d) {
        return getClass(d);
      })
      .attr('fill', function(d) {
        return myNS.colorScale(getClass(d));
      })
      .attr("cy", function(d) {
        return myNS.yScale(+d[myNS.yData]); ///
      });
  });

}//end updateScatter

// Make lengend function adapted from Professor Congdon's code.
// Funcition uses a few "magic numbers" here and there to put all the pieces in
// the correct spot, but
function makeLegend(svg) {
  var xStartPos = -15;
  var yStartPos = 10;
  var yChange = 15;
  var boxDim = 10;
  var textPadding = 15;


  // make a new 'legend' element in the SVG
  // each element in the legend will be 12 pixels below the previous one
  var legend = svg.selectAll('legend')
    .data(myNS.colorScale.domain())
    .enter().append('g')
    .attr('class', 'legend')
    .attr('transform', function(d,i){
      return 'translate(' + xStartPos + ',' + ((i * yChange) + yStartPos) + ')';
    });

  // rects for the legend
  // boxDim x boxDim boxes, on the left side of the legend
  legend.append('rect')
    .attr('x', myNS.padding)
    .attr('width', boxDim)
    .attr('height', boxDim)
    .attr('stroke', 'black')
    .style('fill', myNS.colorScale);

  // text for the legend elements
  // to the right of the boxes, y is the baseline for the text
  legend.append('text')
    .attr("class", "legendText")
    .attr('x', myNS.padding + textPadding)
    .attr('y', yStartPos)
    .text(function(d){ 
      if (d == 0) {
        return ("Bottom third of " + myNS.xData); 
      }
      if (d == 1) {
        return ("Middle third of " + myNS.xData);
      }
      else
         return ("Top third of " + myNS.xData);
     })
    .style("font-size", "12px");

}//end makeLegend

// make initial cirlces, based on initial values for the drop downs
function makeCircles(svg) {
  var radius = 5     // radius for circles
  var data = myNS.dataset; // grab data from namespace

  // create circles colored based on their positioning in the thirds of the data
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", function(d) {
      return getClass(d);
    })
    .attr('fill', function(d) {
      return myNS.colorScale(getClass(d));
    })
    .attr('stroke', 'black')
    .attr("cx", function(d) {
      return myNS.xScale(d[myNS.xData]);  ///
    })
    .attr("cy", function(d) {
      return myNS.yScale(d[myNS.yData]); ///
    })
    .attr("r", radius);
}//end makeCircles

// make the initial axes and labels for the axes
function makeAxesAndLabels(svg) {

  //add a title
  svg.append("text")
     .attr("x", myNS.width/2)
     .attr("y", myNS.padding/5)
     .style("text-anchor", "middle")
     .style("font-weight", "bold")
     .text("Interactive Crime Data Visualization");

  // create X axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (myNS.height - myNS.padding) + ")")
    .call(myNS.xAxis);

  // create Y axis
  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + myNS.padding + ",0)")
    .call(myNS.yAxis);

  // create X label
  svg.append("text")
    .attr("id", "xlabel")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(" + myNS.width/2 + "," +
 (myNS.height - myNS.padding/3) + ")")
    .text(myNS.xData);

  var yAxisPadding = 15;
  // create Y label
  svg.append("text")
    .attr("id", "ylabel")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(" + yAxisPadding + "," +
      (myNS.height/2) + ")" + "rotate(-90)") // rotate y axis label
    .text(myNS.yData);
}//end makeAxesAndLabels

// create the scale functions based on the data held in the namespace.dataset
// this function can be re-called when the data that we're looking at changes
function createScales() {

  // map x values to pixels
  myNS.xScale = d3.scaleLinear()
    .domain([0, d3.max(myNS.dataset, function(d) { return +d[myNS.xData]; })])
    .range([myNS.padding, myNS.width - myNS.padding]);

  // map y values to pixels
  myNS.yScale = d3.scaleLinear()
    .domain([0, d3.max(myNS.dataset, function(d) { return +d[myNS.yData]; })])
    .range([myNS.height - myNS.padding, myNS.padding]);

  // map class names to colors
  myNS.colorScale = d3.scaleOrdinal()
    .domain([0,1,2])
    .range(['red', 'blue', 'orange']);
}//end createScales

// create initial axes
function createAxes() {
  //Define X axis
  myNS.xAxis = d3.axisBottom(myNS.xScale).ticks(5)

  //Define Y axis
  myNS.yAxis =  d3.axisLeft(myNS.yScale).ticks(5)
}//end createAxes

//make the plot options menu
function makeMenu() {
  //get the ids for optgroup elements from the html
  var xmenu = d3.select("#xmetrics");
  var ymenu = d3.select("#ymetrics");

  //initialize x and y data
  myNS.xData = "PctEmploy";
  myNS.yData = "robbbPerPop";

  var xOptions = ["PctEmploy", "PctPopUnderPov",
    "PctNotHSGrad", "PctUnemployed"];
  var yOptions = ["robbbPerPop", "burglPerPop",
    "autoTheftPerPop", "nonViolPerPop"];

  //add options for x and y values
  for (prop in xOptions) {
    xmenu.append("option").attr("value", xOptions[prop]).text(xOptions[prop]);
  }
  for (prop in yOptions) {
    ymenu.append("option").attr("value", yOptions[prop]).text(yOptions[prop]);
   }

  //set initial x and y selections in the menu
  document.getElementById('xSelect').value = "PctEmploy";
  document.getElementById('ySelect').value = "robbbPerPop";
} //end makeMenu

//add values to nameSpace for scatter plot
function createNamespace(data) {

//Width and height of SVG drawing area
  myNS.width = Width;
  myNS.height = Height;
  myNS.padding = 60;   // padding around edges, to make room for axes
                       // for menus, the choice for each one
  myNS.xData = "";
  myNS.yData = "";
  // dataset -- will read this from CSV file
  myNS.dataset = data;

}

/************************************************/
// End Scatter Plot Functions
/************************************************/

/************************************************/
// Begin Bar Chart Functions
/************************************************/

//set up sorting via buttons for the bar graph
function sort(svg, data, xScale, yScale) {
  console.log("sorting")
  //sort in ascending order
  var sortA = d3.selectAll("p")
                .select("button#a"); //sort when "a" button clicked
  sortA.on("click", function() {
          sortAscending(svg, data, yScale, xScale);
        });

  //sort in descending order
  var sortD = d3.selectAll("p")
                .select("button#d"); //sort when d button clicked
  sortD.on("click", function() {
          sortDescending(svg, data, yScale, xScale);
        });
}

// create the initial bars
function makeAndLabelBars (svg,dataset,xScale,yScale) {
  // draw the bars
  svg.selectAll("rect.community")  // added .county to ignore outside rect
    .data(dataset)
    .enter()
    .append("rect")
    .attr("class", "community")
    .attr("x", Padding)
    .attr("y", function(d) {
      return yScale(d.communityname);
    })
    .attr("width", function(d) {return xScale(parseInt(d.population))-Padding;})
    .attr("height", yScale.bandwidth()-BarPadding)
    .attr("fill", function(d) {
      return "rgb(0, 0, " +
  Math.round(parseInt(d.population) * BlueScaling) + ")";
    })
    .style("font-size", "9px");

} // end makeAndLabelBars


// create the axes
function makeAxes (svg, dataset, xScale, yScale) {
  // make axes
  console.log("make axes");

  //add graph label text
  svg.append("text")
     .attr("x", Width/2)
     .attr("y", Padding/4)
     .style("text-anchor", "middle")
     .text("Population size of US communities");

  //xAxis scale & attributes
  var xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickSize(0);

  //translate the x axis up to make room for label
  svg.append('g')
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (Height - Padding) + ")")
    .call(xAxis)

  //add x axis text
  svg.append("text")
    .attr("x", Width/2)
    .attr("y", Height - (Padding/1.5))
    .style("text-anchor", "middle")
    .text("Population Size");

  //yAxis, scaled
  var yAxis = d3.axisLeft(yScale);

  //translate y Axis to the right to make room for label
  svg.append('g')
    .attr("class", "y axis")
    .attr("transform", "translate(" + (Padding) + ",0)")
    .style("font-size", "9px")
    .call(yAxis);

  //add y axis text
  svg.append("text")
    .attr("transform", "rotate(-90)") // rotate vertically
    .attr("y", 0)
    .attr("x", (Padding-Height)/2)
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .text("Community Name");
} // end makeAxes


// create the SVG context and return it
function makeSVGBarChart () {

  // add svg element
  var svg = d3.select("body")
    .select("div#barChart")
    .append("svg")
    .attr("width", Width)
    .attr("height", Height);

  return svg
} // end makeSVG


function sortAscending(svg, dataset, yScale, xScale) {
  //sort dataset based on population and save it in a var
  var sorted = dataset.sort(function(a, b) {
   return parseInt(a.population) - parseInt(b.population);
  });

  //update y Scale domain based on sorted data
  yScale.domain(dataset.map(function(d) {return d.communityname;}));

  //update bars based on the new sorted order
  svg.selectAll("rect.community")
     .data(sorted)
     .transition()
     .duration(500)
     .attr("x", Padding)
     .attr("y", function(d, i) {
       return yScale(sorted[i].communityname);
     })
     .attr("width", function(d){return xScale(parseInt(d.population))-Padding;})
     .attr("height", yScale.bandwidth()-BarPadding)
     .attr("fill", function(d) {
      return "rgb(0, 0, " +
        Math.round(parseInt(d.population) * BlueScaling) + ")";
     });

  //update the y Axis labels
  var yAxis = d3.axisLeft(yScale);
  svg.select(".y.axis")
     .transition()
     .duration(500)
     .call(yAxis);

}//end sortAscending

function sortDescending(svg, dataset, yScale, xScale) {
  //sort dataset based on population and save it in a var
  var sorted = dataset.sort(function (a, b) {
  return parseInt(a.population) - parseInt(b.population);
  }).reverse();

  //update y-axis based on sorted data
  yScale.domain(dataset.map(function(d) {return d.communityname;}));

  //update bars based on new sorted order
  svg.selectAll("rect.community")
     .data(sorted)
     .transition()
     .duration(500)
     .attr("x", Padding)
     .attr("y", function(d, i) {
       return yScale(sorted[i].communityname);
     })
     .attr("width", function(d){return xScale(parseInt(d.population))-Padding;})
     .attr("height", yScale.bandwidth()-BarPadding)
     .attr("fill", function(d) {
      return "rgb(0, 0, " +
        Math.round(parseInt(d.population) * BlueScaling) + ")";
     });

  //update y Axis labels
  var yAxis = d3.axisLeft(yScale)

  svg.select(".y.axis")
     .transition()
     .duration(500)
     .call(yAxis);
}//end sortDescending

//change color of mouse over element programatically
function mouseOverAndOut(svg, xScale, yScale) {
  var bar = svg.selectAll("rect.community");
  bar.on("mouseover", function(d) {
      d3.select(this)
        .attr("fill", "red")
      //Get this bar's x/y values, then augment for the tooltip
      var xPosition = xScale(parseInt(d.population));
      var yPosition = parseFloat(d3.select(this).attr("y")) + 30;

      //Update the tooltip position and value
      d3.select("#tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .select("#value")
        .text("Population size: " + d.population);
      d3.select("#tooltip")
        .select("#titleSect")
        .text(d.communityname);

      //Show the tooltip
      d3.select("#tooltip").classed("hidden", false);
     })
     .on("mouseout", function(d) {
       d3.select(this)
          .attr("fill", function(d) {
            return "rgb(0, 0, " +
            Math.round(parseInt(d.population) * BlueScaling) + ")";
          });
      //Hide the tooltip
      d3.select("#tooltip").classed("hidden", true);
     });
}

function getSubset(data) {
  //create a new array to hold a subset of the original dataset
  var subset = [];
  data.forEach(function(d, i) {
    //ignore the first item in the dataset
    //(the name is much longer and throws of labeling)
    if (i%61 == 0 && i!= 0) {
      subset.push(d);
     }
  });
  return subset;
}

//////////////////////////////////////////////////
// read the data file and setup the visualization
//////////////////////////////////////////////////
d3.csv(Data, function(error, data) {
    // error checking
    if (error) {
      console.log(error)
    }
    else {
      initialize(data)
    }
});
