// original json file from
//https://raw.githubusercontent.com/veltman/baby-names/master/us-states.topojson
// edited to remove non-useful states using http://www.jsoneditoronline.org/

// DONUT
/***********************/
radius = 75;

var color = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888",
      "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var arc = d3.arc()
    .outerRadius(radius - 5)
    .innerRadius(radius - 30);

// MAP
/*************************/
var WIDTH = 700,
    HEIGHT = 500,
    CENTERED;
var MAX_ZOOM = 6;
var MIN_ZOOM = 1;

var PROJECTION = d3.geoAlbersUsa()
    .scale(1570)
    .translate([WIDTH / 2 - 250, HEIGHT / 2 + 100]);

var path = d3.geoPath()
    .projection(PROJECTION);

function plotInitial(error, us, data) {
  var svg = d3.select("body").select("#map")
      .attr("width", WIDTH)
      .attr("height", HEIGHT);

  svg.append("rect")
      .attr("class", "background")
      .attr("width", WIDTH)
      .attr("height", HEIGHT)
      .on("click", clicked);

  var g = svg.append("g");

  g.append("g")
      .attr("id", "states")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path)
      .on("click", clicked);

  g.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) {
        return a !== b;
      }))
      .attr("id", "state-borders")
      .attr("d", path);

  d3.select("#map").selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function(d) {
        return PROJECTION([d.nhd_long, d.nhd_lat])[0];
    })
    .attr("cy", function(d) {
        return PROJECTION([d.nhd_long, d.nhd_lat])[1];
    })
    .attr("r", 2)
    .style("fill", "#6088BB")
    .style("opacity", 0.5);

  var dSvg = d3.select("#donut").append("g")
    .attr("transform", "translate(" + 150 / 2 + "," + 150 / 2 + ")");

  var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.summerpud; });

  var dg = dSvg.selectAll(".arc")
    .data(pie(data))
    .enter().append("g")
    .attr("class", "arc");

  dg.append("path")
    .attr("d", arc)
    .style("fill", function(d) { return color(d.lake_area_ha); });

  dg.append("text")
    .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
    .attr("dy", ".35em")
    .text(function(d) { return d.lake_area_ha; });

  mouseOverAndOut();
}

function updateDonut(d) {
  var donutValues = [
    d.hu12_nlcd2011_pct_11,
    d.hu12_nlcd2011_pct_21,
    d.hu12_nlcd2011_pct_22,
    d.hu12_nlcd2011_pct_23,
    d.hu12_nlcd2011_pct_24,
    d.hu12_nlcd2011_pct_31,
    d.hu12_nlcd2011_pct_41,
    d.hu12_nlcd2011_pct_42,
    d.hu12_nlcd2011_pct_43,
    d.hu12_nlcd2011_pct_52,
    d.hu12_nlcd2011_pct_71,
    d.hu12_nlcd2011_pct_81,
    d.hu12_nlcd2011_pct_82,
    d.hu12_nlcd2011_pct_90,
    d.hu12_nlcd2011_pct_95
  ];

  var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d; });

  d3.select("#donut").selectAll(".arc").remove();

  var dg = d3.select("#donut").selectAll(".arc")
    .data(pie(donutValues))
    .enter().append("g")
    .attr("class", "arc");

  dg.append("path")
    .attr("d", arc)
    .style("fill", function(d) { return color(d); });
}

function mouseOverAndOut() {
  var circle = d3.select("#map").selectAll("circle");
  var durationMils = 1000;
  circle.on("mouseover", function(d) {
      d3.select(this)
        .style("opacity", 1)
        .style("fill", "rgb(244, 194, 17)"); // make moused over circle orange

      // get position of mousedOver datapoint using the absolute bounding box
      // of the circle. the reason that we use this, rather than grabbing the cx
      // or cy values, or by getting the data point and projecting it, is
      // because here we're using a potential zoom. thus it is easiest to simply
      // grab the bounding box of the object and then map the x,y values for the
      // tooltip hover info to the center of the circle
      var pos = this.getBoundingClientRect();
      var x = pos.x + pos.WIDTH/2; // find center of x vals for circle
      var y = pos.y + pos.HEIGHT/2; // find center of y vals for circle
      var lagosname = d.lagosname1;
      if (lagosname == "") {
        lagosname = "NA";
      }

      //Update the tooltip position and texts
      d3.select("#tooltip")
        .style("left", x + "px")
        .style("top", y + "px")
        .select("#lakename")
        .text("Lake name: " + lagosname);
      d3.select("#tooltip")
        .select("#state")
        .text("State: " + d.state_name);

      //Show the tooltip
      d3.select("#tooltip").classed("hidden", false);
      updateDonut(d);
    })
    .on("mouseout", function (d) {
      // on mouseout reset the color to the color scale, and hide the tooltip.
      // the colorscale needs the subset of the data first to know its bounds,
      // so first get the subset of the data and then set the colorscale
      d3.select(this)
         .style("opacity", 0.75) // reset opacity back to 0.75
         .style("fill", function(d) {
           // reset color
           return "#6088BB";
         });
      //Hide the tooltip
      d3.select("#tooltip").classed("hidden", true);
    });
}

function clicked(d) {
  var x, y, k;

  if (d && CENTERED !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 2.5;
    CENTERED = d;
  } else {
    x = WIDTH / 2;
    y = HEIGHT / 2;
    k = 1;
    CENTERED = null;
  }

  var g = d3.select("#map").select("g");
  g.selectAll("path")
      .classed("active", CENTERED && function(d) { return d === CENTERED; });
  g.transition()
      .duration(750)
      .attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-WIDTH", 1.5 / k + "px");

  var circles = d3.selectAll("circle");
  circles.transition()
    .duration(750)
    .style("stroke-WIDTH", 1.5 / k + "px")
    .attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
}

function init() {
  queue()
    .defer(d3.json, "us.json")
    .defer(d3.csv, "map_data.csv")
    .await(plotInitial)
}

window.onload = init();
