var fill = d3.scaleOrdinal(d3.schemeCategory10); 

width = 850;
height = 550;

 d3.csv("data/colors_cloud_plot.csv", function(data) {

    grouped_cars = d3.nest()
            //.key(function(d) { return d.oblast_name; })
            //.key(function(d) { return d.major_oper_names; })
            .key(function(d) { return d.producer; })
            .key(function(d) { return d.model; })
            //.key(function(d) { return d.date; })
            .rollup(function(cars) {
              return cars.map(function(c) {
               return {"color": c.color, "size": +c.size };
              });
            })
            .entries(data);


    // Recursively sum up children's values
    function sumChildren(node) {
      if (node.value) {
        node.values = node.value;   // Ensure, leaf nodes will also have a values array
        delete node.value;          // ...instead of a single value
      }
      node.size = node.values.reduce(function(r, v) {
        return r + (v.value? sumChildren(v) : v.size);
      },0);
      return node.size;

     }


    // Loop through all top level nodes in nested data,
    // i.e. for all countries.
    grouped_cars.forEach(function(node) {
      sumChildren(node);
    });


    buildCloudPlot(grouped_cars);

   d3.select('#inds')
      .on("change", function (d) {
        var sect = document.getElementById("inds");
        var section = sect.options[sect.selectedIndex].value;

        grouped_cars = d3.nest()
                .key(function(d) { return d.producer; })
                .key(function(d) { return d.model; })
                .rollup(function(cars) {
                  return cars.map(function(c) {
                   return {"color": c.color, "size": +c.size };
                  });
                })
                .entries(data);




        // Loop through all top level nodes in nested data,
        // i.e. for all countries.
        grouped_cars.forEach(function(node) {
          sumChildren(node);
        });


        var dropdownData = data.section;
        buildCloudPlot(grouped_cars);

    });
   

    window.returnProducers = function() {
     d3.selectAll("#cloudPlot svg")
     .transition()
     .duration(1000)
     .style("opacity", 0)
     .remove() 

      grouped_cars = d3.nest()
              .key(function(d) { return d.producer; })
              .key(function(d) { return d.model; })
              .rollup(function(cars) {
                return cars.map(function(c) {
                 return {"color": c.color, "size": +c.size };
                });
              })
              .entries(data);

      // Recursively sum up children's values
      function sumChildren(node) {
        if (node.value) {
          node.values = node.value;   // Ensure, leaf nodes will also have a values array
          delete node.value;          // ...instead of a single value
        }
        node.size = node.values.reduce(function(r, v) {
          return r + (v.value? sumChildren(v) : v.size);
        },0);
        return node.size;

       }


      // Loop through all top level nodes in nested data,
      // i.e. for all countries.
      grouped_cars.forEach(function(node) {
        sumChildren(node);
      });


      buildCloudPlot(grouped_cars);


     //d3.select("#carProducerReturnTag").text("Список Виробників Автомобілів"); 
     
    };


});