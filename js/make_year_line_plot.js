



var currentCars = [];

var svg = d3.select("#bigLinePlot")
            .append("svg")
            .attr("width", "450")
            .attr("height", "300")


var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory1);


d3.csv("data/make_year_line_plot.csv", type, function(error, data) {
  if (error) throw error;

    cars = data.columns.slice(1).map(function(id) {
    return {
      id: id.replace(/\s+/g,' '),
      values: data.map(function(d) {
        return {date: d.date, number: d[id]};
        })
      };
    });


    //Довжина шкали Х
    var x = d3.scaleTime()
    .range([0, width]).domain(d3.extent(data, function(d) { return d.date; }));

    //Довжина шкали У
    var y = d3.scaleLinear()
      .range([height, 0])
      .domain([
      d3.min(cars, function(c) { return d3.min(c.values, function(d) { return d.number; }); }),
      d3.max(cars, function(c) { return d3.max(c.values, function(d) { return d.number; }); })
    ]);


    //Шкала кольорів
    var z = d3.scaleOrdinal(d3.schemeCategory1).domain(cars.map(function(c) { return c.id; }));

    Шкала Х
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
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.number); });

    //Створити лінії
    var car = g.selectAll(".car")
      .data(cars, function(d) {return d.id})
      .enter()
      .append("g")
      .attr("class", "car")



   car.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z(d.id); })
      .style("opacity", .5)
      .attr("id", function(d) { return d.id })
      .append("title") 
        .text(function(d) { return d.id });


    d3.select("#button").on("click", function(d) {

      //you are changing the global value here on change event.      
      var name = document.querySelectorAll("#the-basics input")[1].value.replace(/\s+/g,' ').trim().toUpperCase();

      document.querySelectorAll("#the-basics input")[1].value = "";
      addCar(name);
    });

    // window.addCar = function(name) {

    //   if (name == undefined || currentCars.includes(name) ) {}
    //     else {currentCars.push(name);}
    //   console.log(currentCars);


    //   var carsOnClick = cars.filter(function (d) {return currentCars.indexOf(d.id.replace(/\s+/g,' ')) > -1; });


    //   y.domain([
    //     0,
    //     d3.max(carsOnClick, function(c) { return d3.max(c.values, function(d) { return d.number; }); })
    //   ]);

    //   z.domain(carsOnClick.map(function(c) { return c.id; }));

    //   svg.select(".axis.x")
    //       .call(d3.axisBottom(x));
          
    //   //Update Y axis
    //   svg.select(".axis.y")
    //       .transition()
    //       .duration(1000)
    //       .call(d3.axisLeft(y));

    //   var carsUpd = g.selectAll("g.car")
    //       .data(carsOnClick, function(d){return d.id});
      

    //   var carsEnter = carsUpd.enter()
    //       .append("g")
    //       .attr("class", "car");
       
    //   carsEnter
    //       .append("path")
    //       .attr("class", "line")
    //       .style("opacity", .5)
    //       .append("title")
    //         .text(function(d) { return d.id });
      
    //   carsEnter.merge(carsUpd)
    //       .selectAll("path")
    //       .transition()
    //       .duration(1000)
    //       .attr("d", function(d) { return line(d.values) })
    //       .style("stroke", function(d) { return z(d.id) });

    //   carsUpd
    //     .exit()
    //     .remove();


    //   d3.selectAll(".line").on("click", function(dd) {
    //     const index = currentCars.indexOf(dd.id.replace(/\s+/g,' '));
    //     currentCars.splice(index, 1);
    //     addCar();
    //   });


    // }

    // window.emptyLineChart = function() {
    //   currentCars = [];
    //   addCar();
    // }

    // window.deletePreviousLine = function() {
    //   currentCars.pop();
    //   addCar();
    //   console.log(currentCars);
    // }



    // var substringMatcher = function(strs) {
    //   return function findMatches(q, cb) {
    //     var matches, substringRegex;

    //     // an array that will be populated with substring matches
    //     matches = [];

    //     // regex used to determine if a string contains the substring `q`
    //     substrRegex = new RegExp(q, 'i');

    //     // iterate through the pool of strings and for any string that
    //     // contains the substring `q`, add it to the `matches` array
    //     $.each(strs, function(i, str) {
    //       if (substrRegex.test(str)) {
    //         matches.push(str);
    //       }
    //     });

    //     cb(matches);
    //   };
    // };

    // var namesOfCarModels = [];
    // data.columns.slice(1).map(function(id) {return namesOfCarModels.push(id)});

    // $('#the-basics .typeahead').typeahead({
    //   hint: true,
    //   highlight: true,
    //   minLength: 1
    // },
    // {
    //   name: 'namesOfCarModels',
    //   source: substringMatcher(namesOfCarModels)
    // });




});


plotBigLine()

var parseTime = d3.timeParse("%Y-%m");

function type(d, _, columns) {
    d.date = parseTime(d.date);
    for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
    return d;
    }
