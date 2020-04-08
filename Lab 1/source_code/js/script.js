/*
Name : script.js
Details : The main javascript file that handles the creation of the bar chart and the histogram
Author : virajk
*/

$(document).ready(function(){
    
    var global_data = []
    var width = '100';
    var height = '100';
    
    //Read file once
    d3.csv('data/car_data_final.csv').then(function(data){   
        for(i=0;i<data.length;i++){
            global_data[i] = data[i]     
        }
   })
    // Navigation link handling   
    $('.nav-item').click(function(){
        var value = '#'+$(this).attr('value')
        $('.no-face').css('display','none')
        $(value).css('display','block')
        $('.nav-item a').removeClass('active')
        $(this).children('a').addClass('active')
    })
    
    //Handler when each variable for the plot is clicked
    $('.variable').click(function(){  
       d3.select('#hist_slider')        //Histogram Slider
       .style('display',"none")
        .html('')
        d3.select('.hist_slider')
        .style('display',"none")
       
       // Make respective menu item active
       $(".btn:first-child").text($(this).text());
       $(".btn:first-child").val($(this).text());       
       $('.variable').removeClass('active')
       $(this).addClass('active')
        var variable = $(this).html().toLowerCase().split(' ').join('')
        $('.plot_container svg').fadeOut('slow',function(){
        $('.plot_container').html('')
            
/* Code to plot charts/histograms follows
    Links can rage from link1 - linkn where n are the number of dimensions in the dataset
    On click of each link the appropriate dataset will be loaded and depending on the dataset we will see the chart
    Since each datapoint is different we use different handlers to process them.
*/       
        
switch (variable) {
    case 'carmanufacturer':

        var car_man = {}
        for (var i = 0; i < global_data.length; i++) {
            manufacturer = global_data[i].manufacturer.toLowerCase().replace(' ', '_')
            if (car_man.hasOwnProperty(manufacturer) == false) {
                car_man[manufacturer] = 0
            }
            car_man[manufacturer] += 1
        }
        data = []
        keys = Object.keys(car_man)
        for (i = 0; i < 10; i++) { //#change#
            data.push({
                type: keys[i],
                value: car_man[keys[i]]
            })
        }
        renderChart(data,'Manufacturer','Models')
        break;

    case 'fueltype':
        var flex_fuel = 0
        var regular_unleaded = 0
        var diesel = 0
        var premium_unleaded = 0
        var fuel = ''
        for (var i = 0; i < global_data.length; i++) {
            fuel = global_data[i].fuel_type.replace(' ', '').toLowerCase();
            if (fuel.indexOf('flex-fuel') != -1)
                flex_fuel += 1
            else if (fuel.indexOf('regularunleaded') != -1)
                regular_unleaded += 1
            else if (fuel.indexOf('diesel') != -1)
                diesel += 1
            else if (fuel.indexOf('premiumunleaded') != -1)
                premium_unleaded += 1
        }
   
        var dataset = [{
                'type': 'flex_fuel',
                'value': flex_fuel
            },
            {
                'type': 'regular_unleaded',
                'value': regular_unleaded
            },
            {
                'type': 'diesel',
                'value': diesel
            },
            {
                'type': 'premium_unleaded',
                'value': premium_unleaded
            }
        ]

        renderChart(dataset,'Fuel Type','Number of cars')
        break;


    case 'numberofcylinders':

        var cylinder_count = {}
        for (var i = 0; i < global_data.length; i++) {
            type = global_data[i]['cylinders'].toLowerCase().replace(' ', '_')
            if (cylinder_count.hasOwnProperty(type) == false) {
                cylinder_count[type] = 0
            }
            cylinder_count[type] += 1
        }

        data = []
        keys = Object.keys(cylinder_count)

        for (i = 0; i < keys.length; i++) {
            data.push({
                type: keys[i],
                value: cylinder_count[keys[i]]
            })
        }
        renderChart(data,'Cylinder Count','Number of cars')

        break;

    case 'drivetype':
        var wheel_count = {}
        for (var i = 0; i < global_data.length; i++) {
            type = global_data[i]['wheels'].toLowerCase().replace(' ', '_')
            if (wheel_count.hasOwnProperty(type) == false) {
                wheel_count[type] = 0
            }
            wheel_count[type] += 1
        }

        data = []
        keys = Object.keys(wheel_count)
        for (i = 0; i < keys.length; i++) {
            data.push({
                type: keys[i],
                value: wheel_count[keys[i]]
            })
        }
        renderChart(data,'Drive Type','Number of cars')
        break;
        
    case 'marketcategory':
        var cat_count = {}
        for (var i = 0; i < global_data.length; i++) {
            type = global_data[i]['market_category'].toLowerCase().replace(' ', '_')
            if (cat_count.hasOwnProperty(type) == false) {
                cat_count[type] = 0
            }
            cat_count[type] += 1
        }

        data = []
        keys = Object.keys(cat_count)
        for (i = 0; i < keys.length; i++) {
            data.push({
                type: keys[i],
                value: cat_count[keys[i]]
            })
        }
        renderChart(data,'Market Category','Number of cars')
        break; 
        
    case 'yearlaunched':
        var yr_count = {}
        for (var i = 0; i < global_data.length; i++) {
            type = global_data[i]['year'].toLowerCase().replace(' ', '_')
            if (yr_count.hasOwnProperty(type) == false) {
                yr_count[type] = 0
            }
            yr_count[type] += 1
        }

        data = []
        keys = Object.keys(yr_count)
        for (i = 0; i < keys.length; i++) {
            data.push({
                type: keys[i],
                value: yr_count[keys[i]]
            })
        }
        renderChart(data,'Year Launched','Number of cars')
        break;  



    case 'transmissiontype':
        var transmission_count = {}
        for (var i = 0; i < global_data.length; i++) {
            type = global_data[i]['transmission'].toLowerCase().replace(' ', '_')
            if (transmission_count.hasOwnProperty(type) == false) {
                transmission_count[type] = 0
            }

            transmission_count[type] += 1
        }
        data = []
        keys = Object.keys(transmission_count)
        for (i = 0; i < keys.length; i++) {
            data.push({
                type: keys[i],
                value: transmission_count[keys[i]]
            })
        }
        renderChart(data,'Transmission Type','Number of Cars')
        break;


    case 'vehiclesize':
        var size_count = {}
        for (var i = 0; i < global_data.length; i++) {
            type = global_data[i]['size'].toLowerCase().replace(' ', '_')
            if (size_count.hasOwnProperty(type) == false) {
                size_count[type] = 0
            }
            size_count[type] += 1
        }
        data = []
        keys = Object.keys(size_count)
        for (i = 0; i < keys.length; i++) {
            data.push({
                type: keys[i],
                value: size_count[keys[i]]
            })
        }
        renderChart(data,'Vehicle Size','Number of cars')
        break


    case 'vehiclestyle':
        var style_count = {}
        for (var i = 0; i < global_data.length; i++) {
            type = global_data[i]['style'].toLowerCase().replace(' ', '_')
            if (style_count.hasOwnProperty(type) == false) {
                style_count[type] = 0
            }
            style_count[type] += 1
        }
        data = []
        keys = Object.keys(style_count)
        for (i = 0; i < 5; i++) { //#CHANGE#       
            data.push({
                type: keys[i],
                value: style_count[keys[i]]
            })
        }

        renderChart(data,'Vehicle Style','Number of cars')
        break;
    case 'msrp':
        dataset = []
        for (var i = 0; i < global_data.length; i++) {
            var element = {
                value: parseInt(global_data[i]['msrp'])
            }

            
            dataset.push(element)
        }
        preHistogramRender(dataset,'Car Price','Cars in price range')
        break;

    case 'horsepower':
        dataset = []
        for (var i = 0; i < global_data.length; i++) {
            var element = {
                value: parseInt(global_data[i]['horsepower'])
            }
            dataset.push(element)
        }
        preHistogramRender(dataset,'Horsepower','Cars in horsepower range')
        break;
    
     case 'citymileage':
        dataset = []
        for (var i = 0; i < global_data.length; i++) {
            var element = {
                value: parseInt(global_data[i]['citympg'])
            }
            dataset.push(element)
            
        }       
        preHistogramRender(dataset,'City Mileage','Cars in Mileage range')
        break;
        
     case 'popularityscore':
        dataset = []
        for (var i = 0; i < global_data.length; i++) {
            var element = {
                value: parseInt(global_data[i]['popularity'])
            }
            dataset.push(element)
            
        }       
        preHistogramRender(dataset,'Popularity Score','Cars popularity score')
        break;  
        
     case 'highwaymileage':
        dataset = []
        for (var i = 0; i < global_data.length; i++) {
            var element = {
                value: parseInt(global_data[i]['highwaympg'])
            }
            dataset.push(element)
        }
        preHistogramRender(dataset,'Highway Mileage','Cars in Mileage range')
        break;       
        
     case 'numberofdoors':
        var door_count = {}
        for (var i = 0; i < global_data.length; i++) {

            type = global_data[i]['doors'].toLowerCase().replace(' ', '_')

            if (door_count.hasOwnProperty(type) == false) {
                door_count[type] = 0
            }

            door_count[type] += 1
        }

        data = []
        keys = Object.keys(door_count)
        for (i = 0; i < keys.length; i++) {
            data.push({
                type: keys[i],
                value: door_count[keys[i]]
            })
        }
        renderChart(data,'Doors per car','Number of cars')
        break;        
    default:
        $('.plot_container').html('<svg></svg')

}
})
})



    
    function clear() {
        $("#mysvgcontainer").empty()
    }
    
})
//Function that renders our bar-chart
//Called for all categorical variables
function renderChart(dataset,xlabel,ylabel) {

    
    const margin = 25;
    const height = parseInt(d3.select(".plot_container").node().getBoundingClientRect().height *.95 ) - margin*2;
    const width = parseInt(d3.select(".plot_container").node().getBoundingClientRect().width *.95  ) - margin*2;
    
    //Create a new svg element inside the main div
    var svg = d3.select(".plot_container")
    .append('svg')
    .attr('width', width + margin*2 + 'px')
    .attr('height', height + margin*2 + 'px')
    .style('display','None')
    .attr('transform','translate(0,0)') 
    .append('g')
    .attr('transform','translate('+margin+',10)'); 
    
    //Create a color palette, will be used to color the divs of the histogram
    var color_pal = palette('tol-dv',9)
    var color_scale =  d3.scaleQuantize().domain([0,d3.max(dataset,function(d){
        return d.value     
    })]).range(color_pal)

    //Create a variable used for scaling the values across the x axis.
    var xscale = d3.scaleBand()
    .range([0,width])
    //Similarly create a variable for scaling across the y axis.
    var yscale = d3.scaleLinear()
    .range([height,0]) 
    xscale.domain(dataset.map(function(d){
        return d.type.replace('_',' ').toUpperCase()
    }))
    yscale.domain( 
        [0,d3.max(dataset,function(d){ return d.value })*1.5]
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
    .attr('x',function(d){  return xscale(d.type.replace('_',' ').toUpperCase()); })
    .attr('width',xscale.bandwidth()*.90)
    .attr('y',function(d){ return yscale(d.value); })
    .attr('height',function(d){ return height - yscale(d.value) })
    .attr('transform','translate('+rect_margin+',0)')
    .attr('fill',function(d,i){
        //Depending on the value fill with appropriate color
        return("#"+color_scale(d.value))

    })
    .on("mouseover", function(d) {
        
        
        //Event handler on mouseover of each element. Bar width and height is enhanced.
        d3.selectAll('.bar')
        .style('opacity','0.5')
        var bar = d3.select(this)
        var xvalue = d3.select(this).attr("x") - 5
        var wid = d3.select(this).attr("width");
        var hgt = d3.select(this).attr("height")
        

        //All we do is exapnd the width,height and shift the bar a few units to the left
        d3.select(this)
        .attr("x", parseInt(xvalue))
        .attr("width", wid*1.07)
        .attr("height",function(d){ return height - yscale(d.value *1.06 ) })
        .attr('y',function(d){ return yscale(d.value *1.06); })
        .style('opacity','1')
        
        //Code to display the value on top of the bar
        parent = d3.select(this.parentNode).select('text').style('display','block')
        
        
    })
    .on("mouseout", function() {
         
       // Once we move out of the bar return its shape and size to the original state
        d3.selectAll('.bar')
        .style('opacity','1')
        
         parent = d3.select(this.parentNode).select('text').style('display','none')
        var bar = d3.select(this)
        bar.attr('fill',function(d){
        return("#"+color_scale(d.value))
    });

    d3.select(this).attr('x',function(d){  return xscale(d.type.replace('_',' ').toUpperCase()); })
    .attr("width", xscale.bandwidth()*.90)
    .attr('height',function(d){ return height - yscale(d.value) })
    .attr('y',function(d){ return yscale(d.value); })
        
        
    })   
      //Code to append the text above each bar. Hidden initially.
       groups
      .append("text")
      .attr("class", "bar-label")
      .attr("text-anchor", "middle")
      .attr('transform','translate('+rect_margin+',0)')  
      .attr("x", function(d){  return xscale(d.type.replace('_',' ').toUpperCase()) + (xscale.bandwidth()/2)*.92  ; })
      .attr("y", function(d){  return (yscale(d.value)-15); })
      .text(function(d) { return d.value; });

      //Append the y axis 
     var y_axis = d3.axisLeft()
              .scale(yscale);
    svg.append("g")
       .attr("transform", "translate("+margin+", 0)")
       .call(y_axis)
    
    //Add x-axis
    svg.append("text")     
        .attr("x", width/2 )
        .attr("y",  height + margin + 12 )
        .style("text-anchor", "middle")
        .text(xlabel)
        .attr('fill','#f00')
        .style('font-weight','bold')
    

    $('svg').fadeIn('slow')
                        
}

//Function that renders histogram
//Called for numerical variables that fall in  range

function preHistogramRender(dataset,xlabel,ylabel,ticks=35){
  
    //Call this function once for a particular histogram
    
    //Create slider that will change bin size dynimcally
    d3.select('#hist_slider')
    .style('display',"block")
    d3.select('.hist_slider')
    .style('display',"block")
    .stly
  var slider = d3
    .sliderBottom()
    .min(10)
    .max(60)
    .width(300)
    //.tickFormat(d3.format('.2%'))
    .step(1)
    .default(ticks)  
  .ticks(10)
    .on('onchange', val => {
      $('.plot_container').html('')
      // Every time we moeve the slider recompute the histogram based on the bins we provide.
      renderHistogram(dataset,xlabel,ylabel,val)
    });
    
    
  d3.select('#hist_slider')
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,50)')
    .call(slider); 
  //Call the render histogram function
  renderHistogram(dataset,xlabel,ylabel,ticks)
    
    
}

function renderHistogram(dataset,xlabel,ylabel,ticks){
 
    const margin = 25;
    const height = parseInt(d3.select(".plot_container").node().getBoundingClientRect().height *.95) - margin*2;
    const width = parseInt(d3.select(".plot_container").node().getBoundingClientRect().width *.95 ) - margin*2;
    var available_height = height-margin
    
    //Append the main svg to the plot container
     var svg = d3.select(".plot_container")
    .append('svg')
    .attr('width', width + margin*2 + 'px')
    .attr('height', height + margin*2 + 'px')
    .style('display','None')
     .attr('transform','translate(0,0)')
    .append('g')
    .attr('transform','translate('+margin+',10)'); // Y axis of the svg container starts at top left, switch it so that it start from    

    minimum = d3.min(dataset,function(d){ return d.value })
    maximum = d3.max(dataset,function(d){ return d.value })
    
    //Create a scaling function that will enable appending values to the x axis
    var xscale = d3.scaleLinear()
    .domain([minimum,maximum])
    .range([0,width])
    
    //The main histogram function, when this is called with the dataset we create the bins
    var myHistogram = d3.histogram()
    .domain(xscale.domain())
    .value(function(d){
        return d.value;
    })
   .thresholds(xscale.ticks(ticks));
    
    //Create bins for the histogram
    var bins = myHistogram(dataset)
    
    //Create a color pallete for the histogram bars.
    var color_pal = palette('tol-dv',9)
    var color_scale =  d3.scaleQuantize().domain([0,d3.max(bins,function(d){
        return d.length    
    })]).range(color_pal)

    //Create a scaling function for the yaxis, we pass the bins (array of array)
    var yscale = d3.scaleLinear()
    .range([available_height,0])
    .domain([0,d3.max(bins,function(d){
        return d.length
    })*1.5])

    //Append the y axis
    svg.append("g")
    .attr("transform", "translate("+margin+", 0)")
    .call(d3.axisLeft().scale(yscale));
    
    //Append the y axis label, note that it is rotated by 90 degrees
    y_margin = 0 - margin 
    svg
    .append('g')
    .append("text")
    .attr( "transform", "rotate(-90)" )
    .attr("y", y_margin )
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(ylabel)
    .style("fill", "red") 
    .style('font-weight','bold')   

    //Similarly append the x axis
    svg
    .append("g")
    .attr("transform", "translate("+margin+"," + available_height  + ")")
    .call(d3.axisBottom(xscale).ticks(ticks))
    .selectAll('text')
    .attr("transform", "translate(-10,10)rotate(-45)")
    
    //Append the label for the x axis
    svg
    .append('g')
    .append("text")     
    .attr("x", width/2 )
    .attr("y",  available_height + margin  )
    .style("text-anchor", "middle")
    .attr('fill','#f00')
    .style('font-weight','bold')
    .attr('transform','translate(0,'+ margin +')')
    .text(xlabel)
    
    //Create groups in the svg container for each bin
    var groups = svg.selectAll(".group")
    .data(bins)
    .enter()
    .append("g")
    .attr('class','group')
  
  //For each group append the rect required for the histogram bar
  groups
  .append("rect")
  .attr("x", 1)
  .attr("transform", function(d) {
    var xstart = xscale(d.x0)+margin
    return "translate(" + xstart +"," + yscale(d.length) + ")";
  })
  .attr("width", function(d) {      //x0 and x1 are the end and starting x values for a bin.
    return (xscale(d.x1) - xscale(d.x0));
  })
  .attr("height", function(d) {     // Compute the required height from the scaling function we built
    return available_height - yscale(d.length);
  })
  .attr('class','bar')
  .attr('fill',function(d){
      return ('#'+color_scale(d.length))
  })
.on("mouseover", function(d) {
    //On mouse over redice the opacity of other bars. 
    d3.selectAll('.bar')
    .style('opacity','0.5')
    
    //We increase the width/height of our bar slightly on mouse over.
    var bar = d3.select(this)
    bar
   .attr("width", function(d) {
    return (xscale(d.x1) - xscale(d.x0))*1.1;
  })
  .attr("height", function(d) {
    return available_height - yscale(d.length*1.05);
  })
  .attr("transform", function(d) {
    var xstart = xscale(d.x0)+margin*.95
    return "translate(" + xstart +"," + yscale(d.length*1.05) + ")";
  })
  .style('opacity','1')

    //Make the text for the histogram block visible on mouseover    
    parent = d3.select(this.parentNode).select('text').style('display','block')
        
    })
    .on("mouseout", function(d) {
      //On mouseout reset the state of our bar and all other bars back to normal
      d3.selectAll('.bar')
      .style('opacity','1')
      
        parent = d3.select(this.parentNode).select('text').style('display','none')
        var bar = d3.select(this)
       .attr("width", function(d) {
        return (xscale(d.x1) - xscale(d.x0));
      })
      .attr("height", function(d) {
        return available_height - yscale(d.length);
      })
      .attr("transform", function(d) {
        var xstart = xscale(d.x0)+margin
        return "translate(" + xstart +"," + yscale(d.length) + ")";
      })  
     })
    
    // Create a text for each bar of the histogram. This text will be visible on mouse over.
    groups
    .append('text')
    .attr("class", "bar-label")
    .attr("x", 1)
    .attr("transform", function(d) {
        var xstart = xscale(d.x0)+margin
        var width = d3.select(this.parentNode).select('rect').attr('width')/2
        xstart = xstart + (width/2)
        var ystart = yscale(d.length) -13
        return "translate(" + xstart +"," + ystart + ")";
    })
    .style("text-align", "middle")
    .style('font-size',function(d){
        return 13
    })
    .text(function(d) { return d.length; })
    $('svg').fadeIn('slow')
        
}
