

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
residence(function (d){
   myresidence = d.residence;});

function hbonds(callback){
 // List ligands
 request = $.ajax({
   url:"/HBonds",
   method: "POST",
   dataType: 'json',
   success: function(d){callback(d)}
 })
}
var HBonds;
hbonds(function (d){
   HBonds = d.hbonds;});

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
            // Things for barplot
            var my_data = undefined;
            my_data = res.resOnOff[l]
            var margin = {top: 20, right: 20, bottom: 30, left: 20},
                width = 300 - margin.left - margin.right,
                height = 82 - margin.top - margin.bottom;
            // set the ranges
            var x = d3.scaleLinear()
                      .range([0, my_data.length]);
            var y = d3.scaleLinear()
                      .range([height, 0]);

            var barplot = tooltip.append("g")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("x",355)
                .attr("y",margin.left)
                .attr("id",l)
            barplot.attr("transform",
                          "translate(" + margin.left+ "," +String(355+50*l)+ ")")
            barplot.selectAll(".bar")
                  .data(my_data)
                .enter().append("rect")
                  .attr("class", "bar")
                  .style("fill",color(l))
                  .attr("x", function(d,j) {return x(j/my_data.length * width/my_data.length); })
                  .attr("width", width/my_data.length)
                  .attr("y", function(d) { return y(d); })
                  .attr("height", function(d) { return height - y(d); });
            rect.attr("height",function(d){return rec_height+50*(l+1)})
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
                      .on("click", function(){
                        if (d3.select(this).attr("class")==="on"){
                        var rec_height = parseInt(rect.attr("height"))
                        rect.attr("height",function(d){
                          if (parseInt(rect.attr("height"))<350+50*(res.resTime.length))
                          {return parseInt(rect.attr("height"))+50;}else{return rec_height}
                        });




                        }})
                      .on("mouseover", function(d){
                        d3.select(this).style("stroke-width",function(d){if (d3.select(this).attr("class")==="on"){return 3}else{return 0}}).style("stroke","black");
                        if (d3.select(this).attr("class")==="on"){
                        g.append("text")
                          .attr("id","residenceTime_text")
                          .attr("y",17)
                          .style("font-family","monospace")
                          .style("text-anchor","middle")
                          .style("font-size",50)
                          .text(function (d,i){if (i==0){return String(parseInt(d.data.resTime*100))+"%"}});}})
                      .on("mouseout", function(d){
                        d3.select(this).style("stroke-width",0).style("stroke","none");
                        d3Context.selectAll("#residenceTime_text").remove();
                      });
        };};
       };};
       setData();



     }});

     d3Context.selectAll("g.HBonds")
      .on("mouseover", function(d){d3.select(this).style("cursor", "pointer");})
      .on('click', function (d){
       var x_coord = d3.select(this).attr("x");
       var y_coord = d3.select(this).attr("y");
       var height = 200;
       var width = 335;
       var selectedRes = d3.select(this).attr('id');
       //selectAll selections need to start with a letter and cannot start with number
       if (d3Context.selectAll("#hbond"+selectedRes).empty()===true){
       var tooltip = d3Context.select("svg").append("g")
                       .style("visibility", "hidden")
                       .attr("id","#hbond"+selectedRes);
       function dragmove(d) {
               d3.select(this)
                       .attr("transform","translate("+String(d3.event.x-x_coord-width/2)+","+ String(d3.event.y-y_coord-height/2)+")")
               };
       var drag = d3.drag()
           .on("drag", dragmove);

       tooltip.style("visibility", "visible")
                   .style("position","relative")
                   .attr("transform","translate("+String(x_coord)+","+String(y_coord)+")")
                   .on("mouseover", function(d){d3.select(this).style("cursor","grab")})
                   .call(drag)
       tooltip.append("rect")
                   .attr("height",height)
                   .attr("width",width)
                   .attr("rx",20)
                   .attr("ry",20)
                   .style("stroke","black")
                   .style("fill","white")
                   .style("stroke-width",5)
                   .attr("x",parseFloat(x_coord))
                   .attr("y",parseFloat(y_coord))
                   ;
       tooltip.append("text")
                   .style("fill","black")
                   .style("font-size",40)
                   .style("font-weight","bold")
                   .style("font-style","Helvetica")
                   .attr("text-anchor","middle")
                   .attr("x",parseFloat(x_coord)+165.0)
                   .attr("y",parseFloat(y_coord)+38.0)
                   .text("Hydrogen Bonds")

       tooltip.append('text')
                  .style('font-family', 'sans-serif')
                  .style('font-weight','bold')
                  .style('font-size', 30)
                  .attr("x",parseFloat(x_coord)+335.0)
                  .attr("y",parseFloat(y_coord))
                  .text("X")
                  .on("mouseover", function(d){d3.select(this).style("cursor", "pointer").style("fill","red")})
                  .on("mouseout", function(d){d3.select(this).style("fill","black")})
                  .on("click", function(d){return tooltip.style("visibility", "hidden")});
        function setHBonds(){
          var my_data = undefined;
          for (bond of HBonds){
            if (String(selectedRes) === String(bond.bond[0])){

              //Hydrogen bond text stuff
              tooltip.append("text")
                          .style("fill","black")
                          .style("font-size",32)
                          .style("font-weight","bold")
                          .attr("text-anchor","middle")
                          .attr("x",parseFloat(x_coord)+100.0)
                          .attr("y",parseFloat(y_coord)+90.0)
                          .text(String(bond.bond[3])+" "+bond.bond[1])
              tooltip.append("text")
                          .style("fill","black")
                          .style("font-size",32)
                          .style("font-weight","bold")
                          .attr("text-anchor","middle")
                          .attr("x",parseFloat(x_coord)+100.0)
                          .attr("y",parseFloat(y_coord)+122.0)
                          .text(String(bond.bond[0])+" "+bond.bond[2])
              // Arc stuff
              var radius = 50;
              var donutWidth = 13;
              var dataset = undefined;

              var sumPercentage = d3.sum(bond.percentage)/parseFloat(bond.percentage.length)
              dataset =  [
                { label: "on", resTime: parseFloat(sumPercentage)},
                { label: "off", resTime: 100-sumPercentage}
              ];
              var arc = d3.arc().innerRadius(radius).outerRadius(radius-donutWidth)
              var pie = d3.pie()
                  .value(function(d) { return d.resTime; })
                  .sort(null);
              var g = tooltip.append("g")
                            .attr("transform","translate("+String(parseFloat(x_coord)+258.0)+","+String(parseFloat(y_coord)+98.0)+")")
                            .attr("height",90)
                            .attr("width",90)
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
                          return "#9970ab";};
                        })
                        .on("click", function(){
                          if (d3.select(this).attr("class")==="on"){
                          var rec_height = parseInt(rect.attr("height"))
                          rect.attr("height",function(d){
                            if (parseInt(rect.attr("height"))<350+50*(res.resTime.length))
                            {return parseInt(rect.attr("height"))+50;}else{return rec_height}
                          })}});
              g.append("text")
                .attr("y",10)
                .style("text-anchor","middle")
                .style("font-size",36)
                .style("font-family","monospace")
                .text(String(parseInt(sumPercentage))+"%")
              // Barplot stuff
              for (i=0;i < bond.percentage.length;i++){
              my_data = bond.hbondTime[i];
              var margin = {top: 20, right: 20, bottom: 30, left: 20},
                  width = 300 - margin.left - margin.right,
                  height = 82 - margin.top - margin.bottom;
              // set the ranges
              var x = d3.scaleLinear()
                        .range([0, my_data.length]);
              var y = d3.scaleLinear()
                        .range([height, 0]);
              var svg = tooltip.append("g")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .style("z-index","20")
                  .attr("transform",
                        "translate(" + String(parseFloat(x_coord)+margin.left)+ "," + String(parseFloat(y_coord)+150.0)+ ")");
              svg.selectAll(".bar")
                    .data(my_data)
                  .enter().append("rect")
                    .attr("x", function(d,j) {return x(j/my_data.length * width/my_data.length); })
                    .attr("width", width/my_data.length)
                    .attr("y", function(d) { return y(d); })
                    .attr("height", function(d) { return height - y(d); })
                    .style("fill","steelblue");
          }}
        };
      };
      setHBonds();

    }});




   };
