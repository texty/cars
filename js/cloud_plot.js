
function buildCloudPlot(grouped_cars) {

      d3.select("#cloudPlot svg")
      .transition()
      .duration(1000)
      .style("opacity", 0)
      .remove();

      var carTop = d3.scaleLinear().range([15, 75]);
      
        carTop.domain([
          d3.min(grouped_cars, function(d) {return d.size;}),
          d3.max(grouped_cars, function(d) {return d.size;})
          ]);
      
        var layout = d3.layout.cloud()
        .size([width, height])
        .words(grouped_cars)
        .padding(5)
        .rotate(0)
        .text(function(d) { return d.key; })
        .font("Open Sans")
        .fontSize(function(d) {return carTop(d.size); })
        .on("end", drawCloud);
      
        layout.start();
    
    
      function drawCloud(words) {
        d3.select("#cloudPlot").append("svg")
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
            .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("font-family", "Open Sans")
            .style("fill", function(d,i) {  return fill(i);})
            .style("opacity", 1)
            .attr("text-anchor", "middle")
            .attr("class", "carTag")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.key; });

        d3.selectAll(".carTag").on("click", function(d) {
          window.name = d.key;
          updateChart(name);
        });

        d3.select("#carProducerReturnTag").text(""); 

      }
   }

    window.updateChart = function(name) {
        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        d3.select("#cloudPlot svg")
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .remove();


      var newCars;
      grouped_cars.forEach(function(d) {
        if (d.key == name) 
          newCars = d.values;
      })


      var carTop = d3.scaleLinear().range([15, 45]);
    
        carTop.domain([
          d3.min(newCars, function(d) {return d.size;}),
          d3.max(newCars, function(d) {return d.size;})
          ]);
    
        var layout = d3.layout.cloud()
        .size([width, height])
        .words(newCars)
        .padding(5)
        .rotate(0)
        .text(function(d) { return d.key; })
        .font("Open Sans")
        .fontSize(function(d) {if (newCars.length < 2) {return 45} else {return carTop(d.size);} })
        .on("end", reDrawCloud);
      
        layout.start();
    
        function reDrawCloud(words) {
        d3.select("#cloudPlot").append("svg")
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
            .append("g")
              .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
              .data(words)
            .enter().append("text")
              .style("font-size", function(d) { return d.size + "px"; })
              .style("font-family", "Open Sans")
              .style("fill", function(d,i) {  return fill(i);})
              .attr("text-anchor", "middle")
              .attr("class", "modelTag")
              .transition()
              .duration(1000)
              .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
              })
              .text(function(d) { return d.key; });
        }

        d3.selectAll(".modelTag").on("click", function(d) {
          //a way to avoid two word in producer error
          //addCar(d.brand.replace(/\s+/g,' ').trim().toUpperCase());


          addCar(name + " " + d.key);

        });

        d3.select("#carProducerReturnTag").text(name);


//Tooltip
          d3.selectAll(".modelTag")
              .on("mouseover", function(d) {
                     div.transition()
                       .duration(200)
                       .style("opacity", 1);
                    var colorList = [];
                    d.values.forEach(function(d) {
                      colorList.push(d.color + ": " + d.size + "<br/>")
                    })
                    colorList = colorList.join("");
                       div.html(colorList)
                       .style("left", (d3.event.pageX + 30) + "px")
                       .style("top", (d3.event.pageY - 28) + "px")
                       .style("background-color", "grey")
                       .style("color", "white");
                     })
                   .on("mouseout", function(d) {
                     div.transition()
                       .duration(500)
                       .style("opacity", 0);
                     });



      }