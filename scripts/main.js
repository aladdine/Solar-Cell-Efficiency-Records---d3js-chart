var w = 1000;
var h = 650;
var margin = {
	top: 60,
	bottom: 80,
	left: 100,
	right: 80
};
var width = w - margin.left - margin.right;
var height = h - margin.top - margin.bottom;
var svg = d3.select("body")
			.append("svg")
			.attr("id", "chart")
			.attr("width", w)
			.attr("height", h);
var chart = svg.append("g")
			.classed("display", true)
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var colorScale = d3.scale.category10();
var x = d3.scale.linear()
		.domain([
			d3.min(data, function(d){
			return d.year;
			}), 
			d3.max(data, function(d){
			return d.year;
		})])
		.range([0,width]);
var y = d3.scale.linear()
		.domain([0,70])
		.range([height,0]);
var tickValues = [1975,1980,1985,1990,1995,2000,2005,2010,2015, 2020];
var xAxis = d3.svg.axis()
			.scale(x)
			.tickValues(tickValues)
			.tickFormat(function(d){
				return d.toFixed(0);
			})
			.orient("bottom");
var xGridlines = d3.svg.axis()
			.scale(x)
			.tickValues(tickValues)
			.tickSize(-height,-height)
			.tickFormat("")
			.orient("bottom");
var yAxis = d3.svg.axis()
			.scale(y)
			.ticks(7)
			.tickSize(20)
			.tickFormat(function(d){
				return d.toFixed(1);
			})
			.orient("left");
var yGridlines = d3.svg.axis()
				.scale(y)
				.tickSize(-width,0,0)
				.tickFormat("")
				.orient("left");
var responseScale = d3.scale.linear()
					.domain(d3.extent(data, function(d){
						return d.efficiency;
					}))
					.range([0,100]);
function drawAxis(params){
	if(params.initialize){
		this.append("g")
			.classed("gridline x", true)
			.attr("transform", "translate(0," + height + ")")
			.call(params.axis.gridlines.x);
		this.append("g")
			.classed("gridline y", true)
			.attr("transform", "translate(0,0)")
			.call(params.axis.gridlines.y);
		this.append("g")
			.classed("axis x", true)
			.attr("transform", "translate(0," + height + ")")
			.call(params.axis.x);
		this.append("g")
			.classed("axis y", true)
			.attr("transform", "translate(0,0)")
			.call(params.axis.y);
		this.select(".y.axis")
			.append("text")
			.classed("y axis-label", true)
			.attr("transform", "translate(" + -56 + "," + height/2 + ") rotate(-90)")
			.text("Efficiency (%)")
		this.select(".x.axis")
			.append("text")
			.classed("x axis-label", true)
			.attr("transform", "translate(" + width/2 + "," + 48 + ")")
			.text("Year");
		this.append("g")
			.append("text")
			.classed("chart-header", true)
			.attr("transform", "translate(0,-24)")
			.text("");
	}
}
function plot(params){
	drawAxis.call(this, params);
	var self = this;
	var solar_cells = d3.keys(params.data[0]).filter(function(d){
		return d !== "year" && d !== "ref";
	});
	
	//enter() for <g>
	this.selectAll(".solar_cell")
		.data(solar_cells)
		.enter()
			.append("g")
			.attr("class", function(d){
				return d;
			})
			.classed("solar_cell", true);

	//update for <g>
	this.selectAll(".solar_cell")
		.style("fill", function(d,i){
			return colorScale(i);
		})
		.on("mouseover", function(d,i){
			d3.select(this)
				.transition()
				.style("opacity",1)
		})
		.on("mouseout", function(d,i){
			d3.select(this)
				.transition()
				.style("opacity",0.4)
		});

	solar_cells.forEach(function(solar_cell){
		var g = self.selectAll("g."+solar_cell);
		var arr = params.data.map(function(d){
			return {
				key: solar_cell.replace("_"," "),
				value: d[solar_cell],
				year: d.year,
				efficiency: d.efficiency,
				ref: d.ref
			};
		});
		//enter()
		g.selectAll(".efficiency")
			.data(arr)
			.enter()
				.append("circle")
				.classed("efficiency", true);
		//update
		g.selectAll(".efficiency")
			.attr("r", 10)
			.attr("cx", function(d){
				return x(d.year);
			})
			.attr("cy", function(d){
				return y(d.value);
			})
			.on("mouseover", function(d,i){
				var str = "Technology: " + d.key + " | ";
				str += "Year: " + d.year + " | ";
				str += "Ref: " + d.ref + " | ";
				str += "Efficiency: " + d.value + "%";
				d3.select(".chart-header").text(str);
			})
			.on("mouseout", function(d,i){
				d3.select(".chart-header").text("");
			})
		//exit()
		g.selectAll(".response")
			.data(arr)
			.exit()
			.remove();
	});
}
plot.call(chart, {
	data: data,
	axis: {
		x: xAxis,
		y: yAxis,
		gridlines:{
			x: xGridlines,
			y: yGridlines
		}
	},
	initialize: true
})