let padding = 0;
$(function() {
    // do stuff when DOM is ready
	//ward_chart('/crimes_per_ward');
	//map_chart('/create_heat_map');
});
// window.onload = function() {
// ward_chart('/crimes_per_ward');
// };
function map_chart(link,params="") {
	var json_parameters = { "column":"","filter":[]};
	if (params != "" ){
		for(i=0;i<params.length;i++){
			split_text = params[i].split("**")
			json_parameters["column"] = split_text[0]
			json_parameters["filter"].push(split_text[1])

		}
	}
$.ajax({
		"type" : "POST",
		"url":link,
		"async" : true,
		data: JSON.stringify(json_parameters),
		contentType: "application/json",
		dataType: "json",
		success: function(res) {
			make_map(res);
		},
		error: function(res) {
		  $("#chart_container").html(res);
		}
});

}
function factors_chart(link,factor){
    var factors ={'factors': ['shift']
		};
    $.ajax({
	  type: 'POST',
	  url:link,
      contentType: 'application/json; charset=utf-8',
      data: factors,
	  xhrFields: {
		withCredentials: false
	  },
	  headers: {

	  },
	  success: function(res) {
	  	update_chart(res,factor);
	  },
	  error: function(res) {
		$("#chart_container").html(res);
	  }
	});
}
function ward_chart(link,params=""){




	var json_parameters = { "column":"","filter":[]}
	if (params != "" ){
		for(i=0;i<params.length;i++){
			split_text = params[i].split("**")
			json_parameters["column"] = split_text[0]
			json_parameters["filter"].push(split_text[1])
			
		}
	} 
	$.ajax({
		"type" : "POST",
		"url":link,
		"async" : true,
		data : JSON.stringify(json_parameters),
		contentType: "application/json",
		dataType: "json",
		success: function(res) {
			ward_bar_chart(res);
		},
		error: function(res) {
		  $("#chart_container").html(res);
		}
	}) 
	/** 
	$.ajax({
	  "type": callMethod,
	  "data": parameters,
	  "url":link,
      contentType": 'application/json; charset=utf-8',
	  xhrFields: {
		withCredentials: false
	  },
	  headers: {

	  },
	  success: function(res) {
	  	ward_bar_chart(res);
	  },
	  error: function(res) {
		$("#chart_container").html(res);
	  }
	});**/
}
function update_chart(result,factor){
    d3.select('#bar_chart').remove();
	var data;
	data = JSON.parse(result[factor]);
    data.forEach(function (d) {
		d.x = +d.key;
		d.y = +d.value;
	});
}



function ward_bar_chart(result,title){

	$("body").remove(".toolTip")
	var tooltip = d3.select("body").append("div").attr("class", "toolTip");
	svg_cont = d3.select('#ward_chart');
	svg_cont.html("")
	var data = JSON.parse(result.chart_data);

	// var tip = d3.tip()
  	// 			.attr('class', 'd3-tip')
  	// 			.offset([-10, 0])
  	// 			.html(function(d) {
    // 			return "<strong>Frequency:</strong> <span style='color:red'>" + d.counts + "</span>";
  	// 				});
	const margin = 20;
	// var tooltip = d3.select("#tooltip_ward");
	const svg = d3.select('#ward_chart');
	//let width = +svg.attr('width')- 2*margin;
	//let height = +svg.attr('height') - 2*margin;


	var color = d3.scaleOrdinal()
	.domain([ "1","2","3","4","5","6","7","8" ])
	.range([ "#426cf5", "#eba234", "#34ebc6","#ebd334", "#eb3437", "#b1eb34", "#ebbd34", "#a534eb"])

	//const margin = 8;
	const width = 490 - 2 * margin;
	const height = 270 - 2 * margin;


	const chart = svg.append('g')
    .attr('transform', `translate(55, -5)`);
	const xScale = d3.scaleBand()
          .rangeRound([0, width])
          .domain(data.map(function(d){return d.ward;} ))
          .padding(0.1);

	const yScale = d3.scaleLinear()
          .range([height, 20])
          .domain([0,  d3.max(data,function(d){ return Number(d.counts);})]);
	const makeYLines = () => d3.axisLeft()
          .scale(yScale);

	chart.append('g')
          .attr('transform', "translate(0," + height + ")")
          .call(d3.axisBottom(xScale));

	chart.append('g')
		  .call(d3.axisLeft(yScale));

	/*
	.attr("y", function (d) {
		return yScale(Number(d.counts));
	.attr("height", function (d) {
		return height - yScale(Number(d.counts));
	});
	})
	
	


	*/

	chart.append('g')
          .attr('class', 'grid')
          .call(makeYLines()
            .tickSize(-width, 0, 0)
            .tickFormat('')
          );
	chart.selectAll(".bar")
	.data(data)
	.enter().append("rect")
	.attr("class", "bar")
	.attr("x", function (d) {
		return xScale(d.ward);
	})
	.attr("width", xScale.bandwidth())

	.attr("y", function (d) {
		return yScale(Number(d.counts));
	})
	.attr("height", function (d) {
		return height - yScale(Number(d.counts));
	});



	// .on('mouseover', tip.show);

	d3.selectAll("#ward_chart rect")
	.style("fill", function (d) { return color(d.ward.toString()  ) } )
	.on('mouseenter', function (actual, i) {
		d3.selectAll('.value')
		  .attr('opacity', 0)

		  d3.select(this)
		  .transition()
		  .duration(300)
		  .attr('opacity', 0.6)
		  .attr('x', (a) => xScale(a.ward) - 5)
		  .attr('width', xScale.bandwidth() + 10)
		  .attr('fill',"red")

		const y = yScale(actual.count)

		line = chart.append('line')
		  .attr('id', 'limit')
		  .attr('x1', 0)
		  .attr('y1', y)
		  .attr('x2', width)
		  .attr('y2', y)
	  })
	  .on('mouseleave', function () {
		d3.selectAll('.value')
		  .attr('opacity', 1)

		d3.select(this)
		  .transition()
		  .duration(300)
		  .attr('opacity', 1)
		  .attr('x', (a) => xScale(a.ward))
		  .attr('width', xScale.bandwidth())
		  .attr('fill',"steelblue")
		chart.selectAll('#limit').remove()
		chart.selectAll('.divergence').remove()
	  })
	  .on("mousemove", function(d){
		tooltip
		  .style("left", d3.event.pageX - 120 + "px")
		  .style("top", d3.event.pageY - 70 + "px")
		  .style("display", "inline-block")
		  .style("color",color(d.ward.toString()  ))
		  .html( " Ward "+ d.ward +" unemployment rate : "+d.unemployment_rate );
	})
	.on("mouseout", function(d){ tooltip.style("display", "none");});
	  svg
	  .append("g") 
      .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -2 )
          .attr("x",0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Number of crimes");  

	  svg
	  .append("g")    
	  .append("text")
	  .attr("transform", "translate(" + (width / 2) + " ," + (height + margin*1.5) + ")")
	  .style("text-anchor", "middle")
	  .text("Ward Number");
}

function make_pca_plot(result,title){
	d3.select('#pca_plot_svg').remove();
	var data = JSON.parse(result.chart_data);
	data.forEach(function(d) {
      d.x = +d['0'];
      d.y = +d['1'];
      });

    var width = 1300 - margin.left - margin.right;
	var margin = {top: 20, right: 20, bottom: 30, left: 60};
    var width = 540 - margin.left - margin.right;
    var height = 450 - margin.top - margin.bottom;

    var chart_width = "100%";
    var chart_height = "100%" ;
    var xValue = function(d) { return d.x;};
    var xScale = d3.scale.linear().range([0, chart_width]);
    var xMap = function(d) { return xScale(xValue(d)); };
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    var yValue = function(d) { return d.y;};
    var yScale = d3.scale.linear().range([height, 0]);
    var yMap = function(d) { return yScale(yValue(d));};
    var yAxis = d3.svg.axis().scale(yScale).orient("left");
    xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
    var svg = d3.select("#pca_plot").append("svg")
		.attr("id", "pca_plot_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", chart_height)
        .append("g")
        .attr("transform", "translate(250,10)");
	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.attr("class", "x_axis")
		.call(xAxis);

	svg.append("g")
		.attr("class", "y_axis")
		.call(yAxis);

    svg.append("text")
            .attr("class", "axis_label")
            .attr("text-anchor", "middle")
            .attr("transform", "translate("+ (-70) +","+(height/2)+")rotate(-90)")
            .text("PCA Component 2");

    svg.append("text")
        .attr("class", "axis_label")
        .attr("text-anchor", "middle")
        .attr("transform", "translate("+ (chart_width/2) +","+(height + margin.top + margin.bottom)+")")
        .text("PCA Component 1");
    svg.selectAll('ward_chart.dot')
		.data(data)
		.enter().append("circle")
		.attr("r",3.5)
		.attr("cx", xMap)
		.attr("cy", yMap)
		.style("fill","steelblue");
    svg.append("text")
        .attr("class", "chart_name")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(400,0)")
        .text(title);
}

function make_map(result){
	
	//console.log(result);
	//alert("Rendering Map");
	var promises = [d3.json("/static/data/dc_area.json")];
	// dc_map = dc_map.then(function (data) {
	// 	return data;
	// });
	// var features = dc_map.then(function(value) {
   // return Promise.all(value.features);
   //  });
	// console.log(features);
	Promise.all(promises).then(ready);
	function ready(data) {
			//console.log(data[0].features);
	var svg = d3.select( "#dc_map");
	let g = svg.append( "g" );
	let points = svg.append("g");
	let width = svg.attr("width")-100;
	let height = svg.attr("height")-100;
	var dcProjection = d3.geoAlbers()
    .scale( 90000 )
    .rotate( [77.0369,0] )
    .center( [0, 38.9072] )
	.translate( [width/2,120] );

	g.attr("transform", "translate(0,160) rotate(-44)");

	var dc_geopath = d3.geoPath()
    				.projection( dcProjection );
	g.selectAll("path")
    .data( data[0].features )
    .enter()
    .append( "path" )
    .attr( "fill", "#ccc" )
    .attr( "stroke", "#333")
    .attr( "d", dc_geopath );
	var f = JSON.parse(result.chart_data);
	//console.log(f);
	points.selectAll( "path" )
    .data( f )
    .enter()
    .append( "path" )
    .attr( "fill", "#900" )
    .attr( "stroke", "#999" )
    .attr( "d", dc_geopath )
    .attr("class", "crime_point");
    // .on("mouseover", d => d3.select("#label").text(d.properties.ward))
    // .on("mouseout", d => d3.select("#label").text(""));
	points.attr("transform", "translate(0,160) rotate(-44)");

	}

	// var features = dc_map.then(function (data) {
	// 	return data.features;
	// });
	// console.log(features);

}
