$(document).ready(function(){

    //Not called
    function loadMap() {
        var projection = d3.geoEquirectangular();

        var geoGenerator = d3.geoPath()
          .projection(projection);    
    
        json_data = d3.json("static/data/dc_area.json", function(json_data) {
        
            var u = d3.select('#content g.map')
            .selectAll('path')
            .data(json_data.features);
        
            u.enter()
            .append('path')
            .attr('d', geoGenerator);
    
        });



    }


   



})