
function residence(callback){
 // List ligands
 request = $.ajax({
   url:"/residenceTime",
   method: "POST",
   dataType: 'json',
   success: function(d){callback(d)}
 })
}
var myresidence;
residence(function (d){myresidence = d.residence;});


window.onload=function() {
// Get the Object by ID

   d3Context = d3.select(document.getElementById("svg1").contentDocument);
         //this makes sure cursor stays default while on text
   d3Context.selectAll("text").on("mouseover", function(d){d3.select(this).style("cursor", "default")});

   d3Context.selectAll('g.residue')
     .on('click', function (d){
       var selectedRes = d3.select(this).attr('id');
       if (d3Context.selectAll("#"+selectedRes+"group").empty()===true){
       var tooltip = d3Context.select("svg").append("g")
                       .style("visibility", "hidden")
                       .attr("id",selectedRes+"group");
       function dragmove(d) {
               d3.select(this)
                       .attr("transform","translate("+String(d3.event.x - 150)+","+ String(d3.event.y - 200)+")")

               };
       var drag = d3.drag()
           .on("drag", dragmove);
       var x_coord = d3.select(this).attr("x");
       var y_coord = d3.select(this).attr("y");
       var height = 350;
       var width = 300;
       tooltip.style("visibility", "visible")
                   .style("position","relative")
                   .attr("transform","translate("+String(x_coord-width)+","+String(y_coord-height)+")")
                   .on("mouseover", function(d){d3.select(this).style("cursor","grab")})
                   .call(drag)
       var rect = tooltip.append("rect")
                   .attr("height",height)
                   .attr("width",width)
                   .attr("rx",20)
                   .attr("ry",20)
                   .style("stroke","black")
                   .style("fill","white")
                   .style("stroke-width",5)
                   .attr("x",0)
                   .attr("y",0)
                   ;
       tooltip.append("text")
                   .style("fill","black")
                   .style("font-size",40)
                   .style("font-weight","bold")
                   .attr("x",15)
                   .attr("y",38)
                   .text("Residence Time")
       tooltip.append("text")
                   .style("fill","black")
                   .style("font-size",28)
                   .style("text-anchor","middle")
                   .style("font-weight","bold")
                   .attr("x",width/2)
                   .attr("y",70)
                   .text(selectedRes.slice(0,3)+" "+selectedRes.split("_")[0].slice(3)+" chain "+selectedRes.split("_").pop())
       tooltip.append('text')
                  .attr('text-anchor', 'middle')
                  .attr('dominant-baseline', 'central')
                  .style('font-family', 'sans-serif')
                  .style('font-weight','bold')
                  .style('font-size', 30)
                  .attr("x",310)
                  .attr("y",-10)
                  .text("X")
                  .on("mouseover", function(d){d3.select(this).style("cursor", "pointer").style("fill","red")})
                  .on("mouseout", function(d){d3.select(this).style("fill","black")})
                  //Need to work on this
                  .on("click", function(d){d3Context.selectAll("#"+selectedRes+"group").remove()});
       rec_height = parseInt(rect.attr("height"))
       function setData(){for (res of myresidence){
        if (res.resID === selectedRes){
          var color = d3.scaleOrdinal(d3.schemeCategory10);
          for (l=0;l<res.resTime.length;l++){
            var radius = 110;
            var donutWidth = 20;
            var dataset = undefined;
            dataset =  [
              { label: "on", resTime: parseFloat(res.resTime[l])},
              { label: "off", resTime: 1-res.resTime[l]}
            ];


            ////
            ///Things for arcs
            var arc = d3.arc().innerRadius(radius-donutWidth*l).outerRadius(radius-donutWidth*l+donutWidth)
            var pie = d3.pie()
                .value(function(d) { return d.resTime; })
                .sort(null);
            var g = tooltip.append("g")
                          .attr("transform","translate("+String(150)+","+String(210)+")")
                          .attr("height",135)
                          .attr("width",135)
                          .selectAll('path')
                                    .data(pie(dataset))
                                    .enter()
            g.append('path')
                      .style("z-index",20)
                      .attr('d',arc)
                      .attr("class", function(d){
                        return d.data.label
                      })
                      .attr('fill', function(d, i) {
                        if (i==1){return "#ffffff"}else{
                        return color(l);};
                      })
                      .on("mouseover", function(d){
                        circlePercentage = d.data.resTime
                        d3.select(this).style("stroke-width",function(d){if (d3.select(this).attr("class")==="on"){return 3}else{return 0}}).style("stroke","black");
                        if (d3.select(this).attr("class")==="on"){
                        g.append("text")
                          .attr("id","residenceTime_text")
                          .attr("y",17)
                          .style("font-family","monospace")
                          .style("text-anchor","middle")
                          .style("font-size",50)
                          .text(function (d,i){if (i==0){
                            return String(parseInt(circlePercentage*100))+"%"}});}})
                      .on("mouseout", function(d){
                        d3.select(this).style("stroke-width",0).style("stroke","none");
                        d3Context.selectAll("#residenceTime_text").remove();
                      });
        };};
       };};
       setData();



     }});


    d3Context.selectAll('ellipse').
      on("mouseover", function(d){
        d3.select(this).style("stroke","black").style("stroke-width",5);
        var x_coord = d3.select(this).attr("cx");
        var y_coord = d3.select(this).attr("cy");
        var height = 100;
        var width = 150;
        for (atom of atomInfoData){
          if (x_coord == atom.coords[0] && y_coord == atom.coords[1]){
             var name = atom.atomName;
          }
        };
        g = d3Context.select("#molecularDrawing").append("g")
          .attr("id","molInfo")
          .style("position","relative")
          .attr("transform","translate("+String(x_coord-10)+","+String(y_coord-10)+")")
        g.append("rect")
              .attr("width",width)
              .attr("height",height)
              .attr("rx",20)
              .attr("ry",20)
              .style("stroke","black")
              .style("fill","white")
              .style("stroke-width",5)
              .attr("x",0-(width+10))
              .attr("y",0-(height+10))
        g.append("text")
            .style("fill","black")
            .style("font-size",40)
            .style("font-weight","bold")
            .style("font-style","Helvetica")
            .attr("x",0-((width+10)/2))
            .attr("y",0-((height+10)/2))
            .attr("text-anchor","middle")
            .text(name)


      })
      .on("mouseout", function(){
          d3.select(this).style("stroke","none");
          d3Context.selectAll("#molInfo").remove();
      })




   };
