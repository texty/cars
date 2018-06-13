window.changeOblastBrand = function(value) {


    function getMonthArray (min_month, max_month) {
        var min = new Date(min_month + "-01");
        var max = new Date(max_month + "-01");
        var result = [];
        var date = min;
        var year = date.getFullYear();
        var month = date.getMonth();
        while (true) {
            date = new Date(Date.UTC(year, month, 1));
            if (date > max) break;
            //result.push(date);
            //якщо треба не дати а рядок у форматі "2017-01" то 
            result.push(date.toISOString().slice(0,7));
            month++
        }
        return result;
    };


    window.namesOfBrand = [];

    d3.select("#deleteBigLinePlot").on("click", function(){
      remakeLine(null, null);
      //applying opacity to the legend to mark that the lines were deleted. It will allow to rename them later.
      // var myCollection = document.getElementsByClassName("legend");
      // var i;
      // for (i = 0; i < myCollection.length; i++) {
      //     myCollection[i].style.opacity = 0.5;
      // }
    });


    plottingBrandModel(value, "Вінницька область");


    function plottingBrandModel(value, oblast_name) {

            d3.select("#bigLinePlot svg").remove();

            var svg = d3.select("#bigLinePlot")
                        .append("svg")
                        .attr("width", "900")
                        .attr("height", "600")


            var margin = {top: 20, right: 80, bottom: 30, left: 50},
                width = svg.attr("width") - margin.left - margin.right,
                height = svg.attr("height") - margin.top - margin.bottom,
                g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            var x = d3.scaleTime().range([0, width]),
                y = d3.scaleLinear().range([height, 0]),
                z = d3.scaleOrdinal(d3.schemeCategory1);

            d3.csv(value, function(error, data) {

            if (error) throw error;

            var parseTime = d3.timeParse("%Y-%m");

            //data.columns.slice(1).map(function(id) { namesOfFuel.push(id)});


            // fuel = d3.nest()
            //         .key(function(d) { return d.oblast_name; })
            //         .entries(data);


            fuel = d3.nest()
                    .key(function(d) { return d.oblast_name; })
                    .key(function(d) { return d.brand; })
                    .rollup(function(cars) {
                      return cars.map(function(c) {
                       return {"date": c.date, "size": +c.size };
                      });
                    })
                    .entries(data);


            var myDiv = document.getElementById("myDiv");

            //Create array of options to be added


            var array = fuel.map(function(element) { return element.key; })


            //Create and append select list

            if (!document.getElementById("mySelect")) 
            {
                var selectList = document.createElement("select");
                selectList.setAttribute("id", "mySelect");
                myDiv.appendChild(selectList);

                for (var i = 0; i < array.length; i++) {
                    var option = document.createElement("option");
                    option.setAttribute("value", array[i]);
                    option.text = array[i];
                    selectList.appendChild(option);
                }
            }
            

            fuel = fuel.find(function(x) {return x.key == oblast_name}).values
            emptyArray(namesOfFuel);


            //Тут я створив змінну яка контролюватиме кількість елементів на графіку, відніматиме і додаватиме
            var fuelFiltered = [];
            fuel.forEach(function(d) {
                fuelFiltered.push(d.key);
            });


            //Довжина шкали Х
            var x = d3.scaleTime()
            .range([0, width])
            .domain(d3.extent(data, function(d) { return d.date; }).map(function(str){return parseTime(str)}));

            //Довжина шкали У
            var y = d3.scaleLinear()
              .range([height, 0])
              .domain([
              d3.min(fuel, function(c) { return d3.min(c.value, function(d) { return d.size; }); }),
              d3.max(fuel, function(c) { return d3.max(c.value, function(d) { return d.size; }); })
            ]);

            var monthExtent = d3.extent(data, function(d) { return d.date; }).map(function(str){return str});
            var allMonth = getMonthArray(monthExtent[0], monthExtent[1]);


            //Шкала кольорів
            var z = d3.scaleOrdinal(d3.schemeCategory1).domain(fuel.map(function(c) { return c.key; }));




            function addDates(arr) {
                var b = arr.map(function(d) {return d.date})
                // arr.forEach(function(dd){
                //     allMonth.forEach(function(c){
                //         if (dd.date != c)
                //         {
                //             arr.push({date:c, size:0})
                //         }
                //     })
                // })

                var c = allMonth.filter(function(x){return !b.includes(x)});
                c.forEach(function(dd) {arr.push({date:dd, size:0})})
                arr.sort(function(a,b) {return d3.ascending(a.date, b.date)});
            }; 

            fuel.forEach(function(brand) {
                addDates(brand.value ); 
            })


            fuel = fuel.filter(function(brand) {
                var biggest = brand.value.reduce(function(l, e) {
                  return e.size > l.size ? e : l;
                });
                if (biggest.size > 20)
                    return brand;
            });
            

            fuel.forEach(function(d) {namesOfFuel.push(d.key)});


            //Шкала Х
            g.append("g")
                .attr("class", "axis x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            //Шкала У    
            g.append("g")
                .attr("class", "axis y")
                .call(d3.axisLeft(y))
              .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em");
                //.attr("fill", "#000");

            
            var line = d3.line()
                .curve(d3.curveBasis)
                .x(function(d) { return x(parseTime(d.date)); })
                .y(function(d) { return y(d.size); });

            //Створити лінії
            var car = g.selectAll(".car")
              .data(fuel, function(d) {return d.key})
              .enter()
              .append("g")
              .attr("class", "car")

            car.append("path")
              .attr("class", "fuel_line")
              .attr("d", function(d) { return line(d.value); })
              .style("stroke", function(d) { return z(d.key); })
              .style("opacity", .5)
              .attr("id", function(d) { return d.key })
              .append("title") 
                .text(function(d) { return d.key });


            d3.select("#button").on("click", function(d) {
              //you are changing the global value here on change event.      
              var to_add = document.querySelectorAll("#the-basics input")[1].value;

              document.querySelectorAll("#the-basics input")[1].value = "";
              remakeLine(null,to_add);
            });

            d3.selectAll(".fuel_line").on("click", function(d) {

              //you are changing the global value here on change event.      
              var to_remove = d.key;
              remakeLine(to_remove, null);
            });

            d3.select("#mySelect").on("change", function() {
                  var sect = document.getElementById("mySelect");
                  var oblast_name = sect.options[sect.selectedIndex].value;
                  d3.select("#bigLinePlot svg").remove();
                  plottingBrandModel(value, oblast_name);
            });



                window.remakeLine = function(to_remove, to_add) {
                var carsOnClick = 0;

                if (to_add == null) 
                    {
                        fuelFiltered = fuelFiltered.filter(function (d) {return to_remove != d; })
                    }
                        console.log(fuelFiltered);
                if (to_remove == null) 
                    {
                        fuelFiltered.push(to_add);        
                    }
                if (to_remove == null & to_add == null)
                    {
                        emptyArray(fuelFiltered);
                    }



                carsOnClick = fuel.filter(function (d) {return fuelFiltered.indexOf(d.key) > -1; })




                  y.domain([
                    0,
                    d3.max(carsOnClick, function(c) { return d3.max(c.value, function(d) { return d.size; }); })
                  ]);

                  z.domain(carsOnClick.map(function(c) { return c.key; }));

                  svg.select(".axis.x")
                      .call(d3.axisBottom(x));
                      
                  //Update Y axis
                  svg.select(".axis.y")
                      .transition()
                      .duration(1000)
                      .call(d3.axisLeft(y));

                  var carsUpd = g.selectAll("g.car")
                      .data(carsOnClick, function(d){return d.key});
                  

                  var carsEnter = carsUpd.enter()
                      .append("g")
                      .attr("class", "car");
                   
                  carsEnter
                      .append("path")
                      .attr("class", "fuel_line")
                      .style("opacity", .5)
                      .append("title")
                        .text(function(d) { return d.key });
                  
                  carsEnter.merge(carsUpd)
                      .selectAll("path")
                      .transition()
                      .duration(1000)
                      .attr("d", function(d) { return line(d.value) })
                      .style("stroke", function(d) { return z(d.key) });

                  carsUpd
                    .exit()
                    .remove();


                d3.selectAll(".fuel_line").on("click", function(d) {

                  //you are changing the global value here on change event.      
                  var to_remove = d.key;
                  remakeLine(to_remove, null);
                });



            }

        });
    };
}
