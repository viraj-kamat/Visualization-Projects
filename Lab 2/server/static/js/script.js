/*
Name : script.js
Details : The main javascript file that handles the creation of the bar chart and the histogram
Author : virajk
*/

$(document).ready(function(){
    
    var global_data = []
    var width = '100';
    var height = '100';
    var variable = ""
    var sig_dataset = ""
    var pca_dataset = ""



    /**
    $(".plots").click(function(){
        $("#sidemenu a").style("display","block")
        $(".task2").trigger("click")
    
    })
     */

    
    //Handler when each variable for the plot is clicked
    $('.nav-item').click(function(){
        var value = '#'+$(this).attr('value')
        $('.no-face').css('display','none')
        $(value).css('display','block')
        $('.nav-item a').removeClass('active')
        $(this).children('a').addClass('active')

        if (value == "#plots") {
            $("#sidemenu a").css("display","block")
            $(".task1").trigger("click")
        }
    })



    // Handler for which plot is to be activated depending on task clicked in the left pane
    $("#sidemenu a").click(function(){
        var variable_value = $(this).text().toLowerCase().replace(" ","")
        $('.plot_container svg').fadeOut('slow')
        $(".plot_button:first-child").val("Select variable");
        $(".sub_plots").css("display","none")
        if(variable_value == "task2") {
            $("#plot_2").css("display","block")
        }
        else if(variable_value == "task3")  {
            $("#plot_3").css("display","block")
        }
        else if (variable_value == "task1")  {
            $("#plot_1").css("display","block")
            $('.plot_container').html('')
            console.log("Calling URL /elbow_curve")
            $.ajax({
                "type" : "GET",
                "contenttype" : "JSON",
                "url":'/elbow_curve',
                "async" : true,
                "data" : {},
                "success" : function(data){ 
                    $.unblockUI();
                    //console.log(data)
                    renderLine(data,'Number of clusters','SSE per cluster')
                    }
            })  




        }

        
    })





    var task3_task_type = ''
    var task3_dataset = ''
    var distance_metric = ''
    $("#plot_3.sub_plots button.task3_task").click(function(){
        var text = $(this).html().toLowerCase().split(' ').join('_')
        $(".task3_variables_container .dataset-dropdown .plot_button:first-child").val('Select Distance');
        $(".task3_variables_container .dataset-dropdown .plot_button:first-child").html('Select Dataset');

        $(".task3_variables_container .distance_metric_dropdown .plot_button:first-child").val('Select Distance Metric');  
        $(".task3_variables_container .distance_metric_dropdown .plot_button:first-child").html('Select Distance Metric'); 

        $('.plot_container svg').fadeOut('slow',function(){
            
            $('.plot_container').html('<svg></svg>')

            if (text == 'top_two_pca_vectors' ){
                task3_task_type = 'top_two_pca'
            } else if (text == 'visualize_mds_distance' ) {
                task3_task_type = 'mds_plots' 
            } else {
                task3_task_type = 'top_three_attr'
            }
        })
        $("#plot_3 .dataset-dropdown").css('display','block')
        $("#plot_3 .distance_metric_dropdown").css('display','none')
    })

    // For task2 depending upon data/significance render appropriate chart
    $('#plot_3 .dataset-dropdown a').click(function(){  
        // Make respective menu item active
        /*$("#plot_3 .plot_button:first-child").val($(this).text());       
        $('#plot_3 .variable').removeClass('active')
        $(this).addClass('active')
        */
       $(".task3_variables_container .dataset-dropdown .plot_button:first-child").val($(this).text());  
       $(".task3_variables_container .dataset-dropdown .plot_button:first-child").html($(this).text());     
       //$('.task3_variables_container .variable').removeClass('active')


        variable = $(this).html().toLowerCase().split(' ').join('')
        task3_dataset = variable
        $('.plot_container').html('')
        if (task3_task_type == 'mds_plots'){
            $(".task3_variables_container .distance_metric_dropdown .plot_button:first-child").val("Select Distance Metric");  
            $(".task3_variables_container .distance_metric_dropdown .plot_button:first-child").html("Select Distance Metric"); 
            $('.distance_metric_dropdown').css('display','block')
        }
        else {
        $('.distance_metric_dropdown').css('display','none')
            console.log('Please wait')
            makeCallandRender("/scatter_plots/"+task3_task_type+"/"+task3_dataset+"/ignore")
        }            
            
       


    })

    $('#plot_3 .distance_metric_dropdown .variable').click(function(){  
        // Make respective menu item active
        /*$("#plot_3 .plot_button:first-child").val($(this).text());       
        $('#plot_3 .variable').removeClass('active')
        $(this).addClass('active')
        */
        variable = $(this).html().toLowerCase().split(' ').join('')

        $(".task3_variables_container .distance_metric_dropdown .plot_button:first-child").val($(this).text());  
        $(".task3_variables_container .distance_metric_dropdown .plot_button:first-child").html($(this).text()); 
        
        distance_metric = variable.toLowerCase()
        $('.plot_container').html('')


        makeCallandRender("/scatter_plots/"+task3_task_type+"/"+task3_dataset+"/"+distance_metric) 
       
       /* $('.plot_container svg').fadeOut('slow',function(){
            $('.plot_container').html('')
            alert(variable)
            
        }) */
    })



   function makeCallandRender(url){
        $.blockUI();
        xlabel = "";
        ylabel = "";

        if (task3_task_type == "top_two_pca"){
            xlabel = 'Principal component 1'
            ylabel = 'Principal component 2'
        }
        else if( task3_task_type == "mds_plots") {
            xlabel = 'MDS 1'
            ylabel = 'MDS 2'           
        }
        console.log("Calling URL "+url)
        $.ajax({
            "type" : "GET",
            "contenttype" : "JSON",
            "url":url,
            "async" : true,
            "data" : {},
            "success" : function(data){ 
                $.unblockUI();
                //console.log(data)
                if (task3_task_type =="top_two_pca" || task3_task_type == "mds_plots") 
                    renderScatterPlot(data,task3_task_type,task3_dataset,distance_metric,xlabel,ylabel)
                else 
                    renderScatterPlotMatrix(data,task3_task_type)
                }
        })  


   } 

    //For task2 show the PCA data scree plot
    $("#show_data").click(function(){

        $('.plot_container svg').fadeOut('slow',function(){
        $('.plot_container').html('')
        renderChart(pca_dataset,"Principle Component","Explained Variance")
    
      })
    })

    //For task3 show the top3 attributes depending upon the significance
    $("#significance").click(function(){
        $('.plot_container svg').fadeOut('slow',function(){
        $('.plot_container').html('')
        $.ajax({
            "type" : "GET",
            "contenttype" : "JSON",
            "url": "/pca_loadings/"+variable,
            "async" : true,
            "data" : {},
            "success" : function(data){
                sig_dataset = data[variable]
                renderChart(sig_dataset,"Attributes","Significance",false)
            }
        })  
        })
    })

    // For task2 depending upon data/significance render appropriate chart
    $('#plot_2 .variable').click(function(){ 
       // Make respective menu item active
       $("#plot_2 .plot_button:first-child").val($(this).text());  
       $("#plot_2 .plot_button:first-child").html($(this).text());     
       $('#plot_2 .variable').removeClass('active')
       $(this).addClass('active')
        variable = $(this).html().toLowerCase().split(' ').join('')
        $('.plot_container svg').fadeOut('slow',function(){
        $('.plot_container').html('')
        $("#significance,#show_data").css("display","block")
        $("#show_data button").removeClass('btn-primary') 
        $("#show_data button").addClass('btn-success')      
        
        $.ajax({
            "type" : "GET",
            "contenttype" : "JSON",
            "url": "/scree_plot/"+variable,
            "async" : true,
            "data" : {},
            "success" : function(data){
                pca_dataset = data[variable]
                renderChart(pca_dataset,"Principle Component","Explained Variance")
            }
        })
             })
        })


        $(".task2_variables_container button").click(function(){
            $(".task2_variables_container button").removeClass('btn-success')
            $(".task2_variables_container button").addClass('btn-primary')
            $(this).removeClass('btn-primary').addClass('btn-success')

        })
        $(".task3_variables_container .task3_task").click(function(){
            $(".task3_variables_container .task3_task").removeClass('btn-success')
            $(".task3_variables_container .task3_task").addClass('btn-primary')
            $(this).removeClass('btn-primary').addClass('btn-success')

        })



        $("#sidemenu a").click(function(){
            $(".task3_variables_container .dataset-dropdown .plot_button:first-child").val('Select Dataset');
            $(".task3_variables_container .dataset-dropdown .plot_button:first-child").html('Select Dataset');

            $("#plot_2 .plot_button:first-child").val('Select Dataset');
           $("#plot_2 .plot_button:first-child").html('Select Dataset');

            $(".task3_variables_container .distance_metric_dropdown .plot_button:first-child").val('Select Distance Metric');  
            $(".task3_variables_container .distance_metric_dropdown .plot_button:first-child").html('Select Distance Metric'); 
           

            $(".task3_variables_container .task3_task").removeClass('btn-success')
            $(".task3_variables_container .task3_task").addClass('btn-primary')

            $(".task2_variables_container button").removeClass('btn-success')
            $(".task2_variables_container button").addClass('btn-primary')

            $("#significance,#show_data").css("display","none")


            $("#plot_3 .dataset-dropdown").css('display','none')
            $("#plot_3 .distance_metric_dropdown").css('display','none')
            
            $("#sidemenu a").css('background-color','transparent');
            $("#sidemenu a").css('font-weight','normal');
            $("#sidemenu a").css('color','inherit');
        
            $(this).css('color','#999');
            $(this).css('font-weight','bold');
            $(this).css('background-color','rgb(250, 245, 245)');
            
        })


    $("a#default_click").trigger("click")

    })


    function renderLine(dataset,xlabel,ylabel) {


        yaxis_100 = d3.max(dataset,function(d){ return d.y })
        
    
        console.log(dataset)
        const margin = 25;
        const height = parseInt(d3.select(".plot_container").node().getBoundingClientRect().height *.95 ) - margin*2  ;
        const width = parseInt(d3.select(".plot_container").node().getBoundingClientRect().width *.95  ) - margin*2 ;
        
    
    
        //Create a new svg element inside the main div
        var svg = d3.select(".plot_container")
        .append('svg')
        .attr('width', width + margin*2 + 'px')
        .attr('height', height + margin*2 + 'px')
        .style('display','None')
        .append('g')
        .attr('transform','translate('+margin+',5)'); 
        

    
        //Create a variable used for scaling the values across the x axis.
        var xscale = d3.scaleBand()
        .range([0,width])
        //Similarly create a variable for scaling across the y axis.
        var yscale = d3.scaleLinear()
        .range([height,0])
    
        xscale.domain(dataset.map(function(d){
            return d.x
        }))
    
        var yscale  = d3.scaleLinear()
        .range([height,0])
        .domain([0,d3.max(dataset,function(d){
            return d.y     
        })])

         var y_axis = d3.axisLeft()
                      .scale(yscale).ticks(10,"s");
        
        //Append the y axis 
        svg.append("g")
           .attr("transform", "translate("+margin+", 0)")
           .call(y_axis)
        
        //Append the y axis label. Not the transform given to rotate it by 90 degrees
        y_margin = 0 - margin 
        svg.append("text")
        .attr( "transform", "rotate(-90)" )
        .attr("y", y_margin )
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(ylabel)
        .style("fill", "red")
        .style('font-weight','bold')
        
        //Append the x axis
        svg.append('g')
        .attr('transform','translate('+margin+',' + height   + ')')
        .call(d3.axisBottom(xscale))

        var cross_mark = [dataset[2]]

        //console.log(dataset)
        rect_margin = margin + 10
        line_margin = (xscale.bandwidth()*.90)/2 + rect_margin
          svg.append("path")
            .datum(dataset)
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", 1.5)
            .attr('transform','translate('+line_margin+',0)')
            .attr("d", d3.line()
              .x(function(d) { return xscale(d.x) })
              .y(function(d) { return yscale(d.y) })
              )    
        
        //Append line chart

        //Append cross-mark for the kmeans elbow curve
    svg.selectAll('.symbol')
       .data(cross_mark)
       .enter()
       .append('path')
       .attr('transform',function(d,i) { return 'translate('+(xscale(d.x)+line_margin)+','+yscale(d.y)+')';})
        .attr("fill","red")
       .attr('d', d3.symbol().size(50).type( function(d,i) { return d3.symbolTriangle;}) );


    
    //Add x-axis
    svg.append("text")     
        .attr("x", width/2 )
        .attr("y",  height + margin  )
        .style("text-anchor", "middle")
        .text(xlabel)
        .attr('fill','#f00')
        .style('font-weight','bold')
        
    
        $('svg').fadeIn('slow')
                            
    }


//Function that renders our bar-chart
//Called for all categorical variables
function renderChart(dataset,xlabel,ylabel,yaxis_100=true) {

    if (yaxis_100 == true) {
        yaxis_100 = 100   
    } else {
        yaxis_100 = d3.max(dataset,function(d){ return d.y })
    }

    console.log(dataset)
    const margin = 25;
    const height = parseInt(d3.select(".plot_container").node().getBoundingClientRect().height *.95 ) - margin*2  ;
    const width = parseInt(d3.select(".plot_container").node().getBoundingClientRect().width *.95  ) - margin*2 ;
    

    //Code to create data for cumulative exaplined variance
    cum_dataset = []
    var marker_75 = {}
    prev = 0
    for(var i=0;i<dataset.length;i++){
        cum_dataset.push({ "x": dataset[i]["x"], "y": prev+dataset[i]['y']  })
        prev = prev+dataset[i]['y']

        if(prev>=70 && Object.keys(marker_75).length == 0 ){
            marker_75 = { "x": dataset[i]["x"], "y": prev  }
        }
    }






    //Create a new svg element inside the main div
    var svg = d3.select(".plot_container")
    .append('svg')
    .attr('width', width + margin*2 + 'px')
    .attr('height', height + margin*2 + 'px')
    .style('display','None')
    .append('g')
    .attr('transform','translate('+margin+',5)'); 
    
    //Create a color palette, will be used to color the divs of the histogram
    var color_pal = palette('tol-dv',9)
    var color_scale =  d3.scaleQuantize().domain([0,d3.max(dataset,function(d){
        return d.y     
    })]).range(color_pal)

    //Create a variable used for scaling the values across the x axis.
    var xscale = d3.scaleBand()
    .range([0,width])
    //Similarly create a variable for scaling across the y axis.
    var yscale = d3.scaleLinear()
    .range([height,0])

    xscale.domain(dataset.map(function(d){
        return d.x
    }))

    var lineyscale  = d3.scaleLinear()
    .range([height,0])
    .domain([0,yaxis_100])




    yscale.domain( 
        [0,yaxis_100]
    )
     var y_axis = d3.axisLeft()
                  .scale(yscale);
    
    //Append the y axis 
    svg.append("g")
       .attr("transform", "translate("+margin+", 0)")
       .call(y_axis)
    
    //Append the y axis label. Not the transform given to rotate it by 90 degrees
    y_margin = 0 - margin 
    svg.append("text")
    .attr( "transform", "rotate(-90)" )
    .attr("y", y_margin )
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(ylabel)
    .style("fill", "red")
    .style('font-weight','bold')
    
    //Append the x axis
    svg.append('g')
    .attr('transform','translate('+margin+',' + height   + ')')
    .call(d3.axisBottom(xscale))

    // Create a sequence of group elements, these wil be used to append each bar
    groups = svg.selectAll(".group")
    .data(dataset)
    .enter()
    .append("g")
    .attr('class','group')

    //Append each rectangular element denoting the bars
    rect_margin = margin + 10
    groups
    .append('rect')
    .attr('class','bar')
    .attr('x',function(d){  return xscale(d.x); })
    .attr('width',xscale.bandwidth()*.90)
    .attr('y',function(d){ return yscale(d.y); })
    .attr('height',function(d){ return height - yscale(d.y) })
    .attr('transform','translate('+rect_margin+',0)')
    .attr('fill',function(d,i){
        //Depending on the value fill with appropriate color
        return "#4263f5"
        //return("#"+color_scale(d.y))

    })

    y_vertical = [ {"x":marker_75.x,"y":0},{"x":marker_75.x,"y":d3.max(cum_dataset,function(d){return d.y })} ]
    x_vertical = []
    for(var i=0;i<dataset.length;i++){
        x_vertical[i] = {"x":dataset[i]["x"],"y":marker_75.y}
    }


    console.log(x_vertical)
    console.log(y_vertical)

    if (yaxis_100 == 100) {
    line_margin = (xscale.bandwidth()*.90)/2 + rect_margin
      svg.append("path")
        .datum(cum_dataset)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 1.5)
        .attr('transform','translate('+line_margin+',0)')
        .attr("d", d3.line()
          .x(function(d) { return xscale(d.x) })
          .y(function(d) { return lineyscale(d.y) })
          )

      svg.append("path")
        .datum(x_vertical)
        .attr("fill", "red")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr('transform','translate('+margin+',0)')
        .attr("d", d3.line()
          .x(function(d) { return xscale(d.x) })
          .y(function(d) { return lineyscale(d.y) })
          )

      console.log(y_vertical)
      svg.append("path")
        .datum(y_vertical)
        .attr("fill", "red")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr('transform','translate('+line_margin+',0)')
        .attr("d", d3.line()
          .x(function(d) { return xscale(d.x) })
          .y(function(d) { return lineyscale(d.y) })
          )







    }
    //Append line chart


      //Append the y axis 
     var y_axis = d3.axisLeft()
              .scale(yscale);
    svg.append("g")
       .attr("transform", "translate("+margin+", 0)")
       .call(y_axis)
    
    //Add x-axis
    svg.append("text")     
        .attr("x", width/2 )
        .attr("y",  height + margin  )
        .style("text-anchor", "middle")
        .text(xlabel)
        .attr('fill','#f00')
        .style('font-weight','bold')
    

    $('svg').fadeIn('slow')
                        
}

var fields_domain = null
var margin = 25;
var height = parseInt(d3.select(".plot_container").node().getBoundingClientRect().height *.95 );
var width = parseInt(d3.select(".plot_container").node().getBoundingClientRect().width *.95  );
var padding = 20;
var size = 230;




function renderScatterPlot(dataset,type,dataset_type,distance_metric='',xlabel='default',ylabel='default') {

    console.log("Rendering ScatterPlot.")
    console.log(dataset)
    dataItems = [];
    if(type == "top_two_pca") {
        if (dataset_type != 'stratifieddata') {
            carTypes = ['Compact','Large','Midsize'];
            var map = d3.map({'Compact': 'red', 'Large': "green", 'Midsize': "blue"}); 
        }
        else {
            carTypes = ['Cluster_0','Cluster_1','Cluster_2','Cluster_3']; 
            var map = d3.map({0: "red", 1: "green", 2: "blue", 3 : "pink"});
        }
        for (var i=0;i<carTypes.length;i++) {
            dataItems = dataItems.concat(dataset[carTypes[i]])
        }
    }
    else if (type == 'mds_plots') {
        dataset = dataset[distance_metric]
        //console.log(dataset)
        if (dataset_type != 'stratifieddata') {
            carTypes = ['Compact','Large','Midsize'];
            var map = d3.map({'Compact': 'red', 'Large': "green", 'Midsize': "blue"}); 
        }
        else {
            carTypes = ['Cluster_0','Cluster_1','Cluster_2','Cluster_3']; 
            var map = d3.map({0: "red", 1: "green", 2: "blue", 3 : "black"});
        }
        dataItems = dataset
        console.log(dataItems)
    }
        
        const margin = 25;
        const height = parseInt(d3.select(".plot_container").node().getBoundingClientRect().height *.98 ) - margin*2;
        const width = parseInt(d3.select(".plot_container").node().getBoundingClientRect().width *.98  ) - margin*2;
        
        //Create a new svg element inside the main div
        var svg = d3.select(".plot_container")
        .append('svg')
        .attr('width', '100%' ) //width + margin*2 + 'px'
        .attr('height', height + margin*2 + 'px')
        //.style('display','None')
        .attr('transform','translate(0,0)') 
        .append('g')
        .attr('transform','translate('+margin+',6)');   
        
        //Create a variable used for scaling the values across the x axis.
        var xscale = d3.scaleLinear()
        .range([0,width])
        //Similarly create a variable for scaling across the y axis.
        var yscale = d3.scaleLinear()
        .range([height,0])  
    
    
        yscale.domain( 
            [ d3.min(dataItems,function(d){ return d[1] }) , d3.max(dataItems,function(d){ return d[1] }) ]
        )

        xscale.domain( 
            [ d3.min(dataItems,function(d){ return d[0] }) , d3.max(dataItems,function(d){ return d[0] }) ]
        )

    
        
        var y_axis = d3.axisLeft()
        .scale(yscale).ticks(10,"s");

        //Append the y axis 
        svg.append("g")
        .attr("transform", "translate("+margin+", 0)")
        .call(y_axis) 

        //Append the x axis
        svg.append('g')
        .attr('transform','translate('+margin+',' + height   + ')')
        .call(d3.axisBottom(xscale))  
            

        console.log(dataItems)
        // Add dots
        rect_margin = margin + 10
        svg.append('g')
        .selectAll("dot")
        .data(dataItems)
        .enter()
        .append("circle")
        .attr('transform','translate('+rect_margin+',0)')
        .attr("cx", function (d) { return xscale(d[0]); } )
        .attr("cy", function (d) { return yscale(d[1]); } )
        .attr("r", 3)
        .style("fill", function(d){


            if (dataset_type != 'stratifieddata') 
                return map.get(d[2])
            else 
                return map.get(d[2])
    
             

        })

        //Append the y axis label. Not the transform given to rotate it by 90 degrees
        y_margin = 0 - margin 

        if (type == "mds_plots"){
            y_margin = y_margin
        }

        svg.append("text")
        .attr( "transform", "rotate(-90)" )
        .attr("y", y_margin )
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(ylabel)
        .style("fill", "red")
        .style('font-weight','bold')

        //Add x-axis
        svg.append("text")     
        .attr("x", width/2 )
        .attr("y",  height + margin - 3 )
        .style("text-anchor", "middle")
        .text(xlabel)
        .attr('fill','#f00')
        .style('font-weight','bold')


        svg.selectAll("mydots")
        .data(carTypes)
        .enter()
        .append("circle")
          .attr("cx", 0 + margin + 10 ) // 
          .attr("cy", function(d,i){ return height - 5 - i*15 })  //0 + i*15
          .attr("r", 3)
          .style("fill", function(d){   
            
            if(dataset_type == "stratifieddata") 
                return map.get( parseInt(d.split("_")[1]) ) 
            else 
                return map.get( d )
        
            } )

         
          svg.selectAll("mylabels")
          .data(carTypes)
          .enter()
          .append("text")
            .attr("x", 0+margin+20)
            .attr("y", function(d,i){ return height - 5 - i*15 }) 
            .attr("font-size", "smaller" )
            .style("fill", function(d){ 
                 
            if(dataset_type == "stratifieddata") 
                return map.get( parseInt(d.split("_")[1]) ) 
            else 
                return map.get( d )   
            
            })
            .text(function(d){ return d.split('_').join(' ') })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")      
        
}


function renderScatterPlotMatrix(dataSet, type,dataset_type ) {
    d3.select('#chart').remove();

    var plotData = dataSet
    var size = 180
    var padding = 10

    temp_data = []
    for(var i=0;i<plotData.length;i++){
        temp_data[i] = JSON.parse(plotData[i])
    }
    plotData = temp_data

    var attributeNames = d3.keys(plotData[0])
    var width = parseInt(d3.select(".plot_container").node().getBoundingClientRect().width)


    var x = d3.scaleLinear()
        .range([padding / 2, size - padding / 2]);

    var y = d3.scaleLinear()
        .range([size - padding / 2, padding / 2]);

    var xAxis = d3.axisBottom(x).ticks(6);

    var yAxis = d3.axisLeft(y).ticks(6);

    var color = d3.scaleOrdinal(d3.schemeCategory10);
    const height = parseInt(d3.select(".plot_container").node().getBoundingClientRect().height  ) //*.95
    data = {
    };

    data[attributeNames[0]] = [];
    data[attributeNames[1]] = [];
    data[attributeNames[2]] = [];


    for(var i=0;i<plotData.length;i++){
        data[attributeNames[0]][i] = plotData[i][attributeNames[0]];
        data[attributeNames[1]][i] = plotData[i][attributeNames[1]];
        data[attributeNames[2]][i] = plotData[i][attributeNames[2]];
    }

    var attributeDomain = {},
        attributeNames = d3.keys(data).filter(function (d) {
            return d !== "clusterid";
        }),
        num_attributes = attributeNames.length;

    xAxis.tickSize(size * num_attributes);
    yAxis.tickSize(-size * num_attributes);

    attributeNames.forEach(function (attribute) {
        attributeDomain[attribute] = d3.extent(d3.values(data[attribute]));
    });

    var svg = d3.select(".plot_container").append("svg")
        .attr('id', 'chart')
        .attr("width", size * num_attributes + padding)
        .attr("height", height) //size * n + padding
        .append("g")
        .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

    svg.selectAll(".x.axis")
        .data(attributeNames)
        .enter().append("g")
        .attr("class", "x axis")
        .attr("transform", function (d, i) {
            return "translate(" + (num_attributes - i - 1) * size + ",0)";
        })
        .each(function (d) {
            x.domain(attributeDomain[d]);
            d3.select(this).call(xAxis);
        });

    svg.selectAll(".y.axis")
        .data(attributeNames)
        .enter().append("g")
        .attr("class", "y axis")
        .attr("transform", function (d, i) {
            return "translate(0," + i * size + ")";
        })
        .each(function (d) {
            y.domain(attributeDomain[d]);
            d3.select(this).call(yAxis);
        });



    var cell = svg.selectAll(".cell")
        .data(cross(attributeNames, attributeNames))
        .enter().append("g")
        .attr("class", "cell")
        .attr("transform", function (d) {
            return "translate(" + (num_attributes - d.i - 1) * size + "," + d.j * size + ")";
        })
        .each(plotMatrix);

    cell.filter(function (d) {
        return d.i === d.j;
    }).append("text")
        .attr("x", padding)
        .attr("y", padding)
        .attr("dy", ".71em")
        .text(function (d) {
            return d.x;
        });

    function plotMatrix(p) {
        var cell = d3.select(this);
        x.domain(attributeDomain[String(p.x)]);
        y.domain(attributeDomain[String(p.y)]);
        cell.append("rect")
            .attr("class", "frame")
            .attr("x", padding / 2)
            .attr("y", padding / 2)
            .attr("width", size - padding)
            .attr("height", size - padding);

        comp_1 = data[String(p.x)];
        comp_2 = data[String(p.y)];



        result_array = []
        second = d3.values(comp_2)
        d3.values(comp_1).forEach(function (item, index) {
            tempMap = {};
            tempMap["x"] = item;
            tempMap["y"] = second[index];
            result_array.push(tempMap);
        });

        cell.selectAll("circle")
            .data(result_array)
            .enter().append("circle")
            .attr("cx", function (d) {
                return x(d.x);
            })
            .attr("cy", function (d) {
                return y(d.y);
            })
            .attr("r", 2)
            .style("fill", function (d) {
                return 'red'
            });
    }
}

function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
}
