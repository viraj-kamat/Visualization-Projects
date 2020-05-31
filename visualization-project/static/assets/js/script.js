var factors = {}
var selected_factors = []
$(document).ready(function(){

   

$(".dropdown .dropdown-menu.factor_values a").click(function(){

    parent_button = $(this).parent().parent().find('.btn-secondary')
    parent_button.html($(this).html())

    param = $(this).html().toLowerCase().split('.').join('').split(' ').join('_')

    ward_chart('/crimes_per_ward',"")
    renderScatterplots("")
    map_chart('/create_heat_map')
    showFactors(param)

})



function showFactors(param1) 
{
   

    function barchart(data) {
        

        $("body").remove(".toolTip")
        var tooltip = d3.select("body").append("div").attr("class", "toolTip");


        const svg = d3.select('#bar_hist');

        //const svgContainer = d3.select('#bar_hist');
        
        svg.html("")
        const margin = 8;
        const width = 480 - 2 * margin;
        const height = 240 - 2 * margin;
    
        const chart = svg.append('g')
          .attr('transform', 'translate(56,0)');
    
        const xScale = d3.scaleBand()
          .range([0, width])
          .domain(data.map((s) => s.name))
          .padding(0.3)
        
        const yScale = d3.scaleLinear()
          .range([height, 0])
          .domain([0,  d3.max(data,function(d){ return d.count })]);
    
        // vertical grid lines
        // const makeXLines = () => d3.axisBottom()
        //   .scale(xScale)
    
        const makeYLines = () => d3.axisLeft()

          .scale(yScale)
          .scale(yscale).ticks(10,"s");

    
        chart.append('g')
          .attr('transform', `translate(0, ${height})`)
          .call(d3.axisBottom(xScale))
          .selectAll('text')
          .attr("transform", "translate(-10,10)rotate(-45)")
          .style("font-size", "7px")         
          ;
    
        chart.append('g')
          .call(d3.axisLeft(yScale))
          ;
    

    
        const barGroups = chart.selectAll()
          .data(data)
          .enter()
          .append('g')
    

/*


*/

/*

          .attr("y",  d => { return height; })
          .attr("height", 0)
              .transition()
              .duration(750)
              .delay(function (d, i) {
                  return i * 150;
              })
            .attr("y",  d => { return yScale(d.count); })      
            .attr("height",  d => { return height - yScale(d.count); })


*/

        barGroups
          .append('rect')
          .attr('class', 'bar')
          .attr('x', (g) => xScale(g.name))
          .attr('width', xScale.bandwidth())

          .attr('y', (g) => yScale(g.count))
          .attr('height', (g) => height - yScale(g.count))


          .attr('fill',"#80cbc4")
          .on("click", function(d) {
            val = param1+"**"+d.name.toLowerCase().split(" ").join("_")
            if(selected_factors.indexOf(val) == -1) {
                selected_factors.push(val); 
                 d3.select(this).attr("fill","#ff9900")
                 ward_chart('/crimes_per_ward',selected_factors)
                 map_chart('/create_heat_map',selected_factors)
                 renderScatterplots(selected_factors)
                }
            else {
                selected_factors.splice(selected_factors.indexOf(d), 1);
                 d3.select(this).attr("fill","#80cbc4");
                 ward_chart('/crimes_per_ward',selected_factors)
                map_chart('create_heat_map',selected_factors)
                 renderScatterplots(selected_factors)
                 }

            


            })
          .on('mouseenter', function (actual, i) {
            d3.selectAll('.value')
              .attr('opacity', 0)

              d3.select(this)
              .transition()
              .duration(300)
              .attr('opacity', 0.6)
              .attr('x', (a) => xScale(a.name) - 5)
              .attr('width', xScale.bandwidth() + 10)
    
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
              .attr('x', (a) => xScale(a.name))
              .attr('width', xScale.bandwidth())
    
            chart.selectAll('#limit').remove()
            chart.selectAll('.divergence').remove()
          })

          .on("mousemove", function(d){
            tooltip
              .style("left", d3.event.pageX - 50 + "px")
              .style("top", d3.event.pageY - 70 + "px")
              .style("display", "inline-block")
              .html( d.count + " cases" );
        })
        .on("mouseout", function(d){ tooltip.style("display", "none");});
          
         

  
      // Add the text label for the Y axis
      svg
      .append("g") 
      .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -3 )
          .attr("x",0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Number of crimes");        
         

   // Add the text label for the x axis
    svg
    .append("g")    
    .append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin*5) + ")")
    .style("text-anchor", "middle")
    .text(param1.charAt(0).toUpperCase() + param1.slice(1));

 

    }

    bar_factors = ["offense", "district", "method", "shift", "psa","quad","crimetype"]
    hist_factors = ["day"]
    var combined = bar_factors.concat(hist_factors)

    if (combined.indexOf(param1) != -1) 

        $.ajax({
            "type" : "GET",
            "contenttype" : "JSON",
            "url":'http://localhost:5000/get_barchart_data/'+param1,
            "async" : true,
            "data" : {},
            "success" : function(data){
                
                if (bar_factors.indexOf(param1) != -1) {
                    barchart(data) 
                } else {
                    render_histogram(data)

                }


            }
        })       
    
    
       


}


/*
$.ajax({
    "type" : "GET",
    "contenttype" : "JSON",
    "url":'http://localhost:5000/show_me_factors',
    "async" : true,
    "data" : {},
    "success" : function(data){ 
        factors = data
        
    }
})  
*/

function renderScatterplots(params="") {


    function createPlot(res) {

        data = res['charts']
        // set the dimensions and margins of the graph
        const margin = 8;
        const width = 480 - 2 * margin;
        const height = 240 - 2 * margin;

        // append the svg object to the body of the page

        d3.select("#pca_plot").html("")

        var svg = d3.select("#pca_plot")
            .append("g")
            .attr("width", width )
            .attr("height", height  )
            .attr("transform","translate(45,0)")    


        // Add X axis
        var x = d3.scaleLinear()
            .domain([d3.min(data,function(d){ return d.x }), d3.max(data,function(d){ return d.x })])
            .range([ 0, width ]);
        svg.append("g")
            .attr("transform", "translate(5," + height + ")")
            .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
        .domain([d3.min(data,function(d){ return d.y }), d3.max(data,function(d){ return d.y })])
        
            .range([ height, 0]);
        svg.append("g")
        .attr("transform", "translate(5,0)")
            .call(d3.axisLeft(y));

            var color = d3.scaleOrdinal()
            .domain([ "1","2","3","4","5","6","7","8" ])
            .range([ "#426cf5", "#eba234", "#34ebc6","#ebd334", "#eb3437", "#b1eb34", "#ebbd34", "#a534eb"])


        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", function (d) { return "dot " + d.ward } )
            .attr("cx", function (d) { return x(d.x); } )
            .attr("cy", function (d) { return y(d.y); } )
            .attr("r", 4)
            .style("fill", function (d) { return color(d.ward) } )
            .attr("transform","translate(25,-5)");
            //.on("mouseover", highlight)
            //.on("mouseleave", doNotHighlight )

  
      // Add the text label for the Y axis 
      d3.select("#pca_plot")
      .append("g") 
      .attr("transform", " translate(38,25)")
      .append("text")
          .attr("transform", " rotate(-90)")
          .attr("y", -38 )
          .attr("x",0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Principal component 1");   


    // Add the text label for the x axis
    d3.select("#pca_plot")
    .append("g")   
    .append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin*5) + ")")
    .style("text-anchor", "middle")
    .text("Principal component 2");


          

    }


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
		"url":'/render_scatterplots/',
		"async" : true,
		data : JSON.stringify(json_parameters),
		contentType: "application/json",
		dataType: "json",
		success: function(res) {
			createPlot(res)
		}
	})
}


$(".dropdown .dropdown-menu.factor_values a:first-child").trigger("click")
//showFactors("offense")



})