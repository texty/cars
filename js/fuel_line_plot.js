//
// D3 locale change
//
d3.timeFormatDefaultLocale({
    "decimal": ".",
    "thousands": " ",
    "grouping": [3],
    "currency": ["грн", ""],
    "dateTime": "%a %b %e %X %Y",
    "date": "%d.%m.%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
    "shortDays": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    "months": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    "shortMonths": ["січ", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов", "лис", "гру"]
});
//
var formatMonth = d3.timeFormat("%b");
var formatYear = d3.timeFormat("%Y");

function multiFormat(date) {
    return (d3.timeYear(date) < date ? formatMonth : formatYear)(date);
}

var sect = document.getElementById("inds");
var path = sect.options[sect.selectedIndex].value;

var fuel;  // Повні дані із csv
var carsOnClick; // Поточні дані на момент промальовки


window.namesOfFuel = [];

plotting(path);

$('#the-basics .typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    },
    {
        name: 'namesOfFuel',
        source: substringMatcher(namesOfFuel)
    });


window.change = function (value) {
    if (value == "data/oblast_name_brand_line_plot_long.csv") {
        d3.selectAll(".legend").remove();
        changeOblastBrand(value);
        emptyArray(namesOfFuel);
    }
    else {

        if (document.querySelector("#mySelect") != null) {
            document.querySelector("#mySelect").remove();
            d3.selectAll(".legend").remove();
            plotting(value);
        }
        else
            d3.selectAll(".legend").remove();
        plotting(value);
    }

}


function plotting(path) {
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    d3.select("#bigLinePlot svg").remove();

    var svg = d3.select("#bigLinePlot")
        .append("svg")
        .attr("width", "100%");

    var container_width = svg.node().getBoundingClientRect().width;
    var container_height = container_width * 0.7; // співвідношення сторін

    svg.attr("height", container_height + 'px');

    var margin = {top: 0, left: 0, right: 0, bottom: 0},
        width = container_width - margin.left - margin.right,
        height = container_height - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]);

    if (path == "data/oblast_name_brand_line_plot_long.csv") {
        changeOblastBrand(path);
    }

    else

        d3.csv(path, type, function (error, data) {
            if (error) throw error;

            emptyArray(namesOfFuel);

            data.columns.slice(1).map(function (id) {
                namesOfFuel.push(id)
            });

            fuel = data.columns.slice(1).map(function (id) {
                return {
                    id: id.replace(/\s+/g, ' '),
                    values: data.map(function (d) {
                        return {date: d.date, number: d[id]};
                    })
                };
            });

            carsOnClick = fuel; // При першій промальовці малюємо всі дані

            window.downloadData = function () {
                var exportData = [];

                carsOnClick.forEach(function(row) {
                    row.values.forEach(function(value) {
                        exportData.push({id: row.id, date: value.date, number: value.number})
                    });
                });

                var csvContent = "data:text/csv;charset=utf-8," +
                    "id,date,number\n" +
                    exportData.map(function(obj){
                        return [obj.id, obj.date, obj.number].join(",");
                    }).join("\n");

                var encodedUri = encodeURI(csvContent);
                var link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "data.csv");
                link.innerHTML= "Click Here to download";
                document.body.appendChild(link); // Required for FF
                link.style.visibility = 'hidden';
                link.click();
            };

            //Тут я створив змінну яка контролюватиме кількість елементів на графіку, відніматиме і додаватиме
            var fuelFiltered = [];
            carsOnClick.forEach(function (d) {
                fuelFiltered.push(d.id);
            });


            //Довжина шкали Х
            var x = d3.scaleTime()
                .range([0, width]).domain(d3.extent(data, function (d) {
                    return d.date;
                }));

            //Довжина шкали У
            var y = d3.scaleLinear()
                .range([height, 0])
                .domain([
                    d3.min(carsOnClick, function (c) {
                        return d3.min(c.values, function (d) {
                            return d.number;
                        });
                    }),
                    d3.max(carsOnClick, function (c) {
                        return d3.max(c.values, function (d) {
                            return d.number;
                        });
                    })
                ]);


            //Шкала кольорів
            var z = d3.scaleOrdinal(["#008D9E"]).domain(carsOnClick.map(function (c) {
                return c.id;
            }));

            //Шкала Х
            g.append("g")
                .attr("class", "axis x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).tickFormat(multiFormat));

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
                .x(function (d) {
                    return x(d.date);
                })
                .y(function (d) {
                    return y(d.number);
                });

            //Створити лінії
            var car = g.selectAll(".car")
                .data(carsOnClick, function (d) {
                    return d.id
                })
                .enter()
                .append("g")
                .attr("class", "car")


            car.append("path")
                .attr("class", "fuel_line")
                .attr("d", function (d) {
                    return line(d.values);
                })
                .style("stroke", function (d) {
                    return z(d.id);
                })
                .style("opacity", .5)
                .attr("id", function (d) {
                    return d.id
                })
                .style("z-index", 0.5)
                .append("title");


            // add legend   

            //ЖАЛЮГІДНІ СПРОБИ ЗРОБИТИ ЛЕГЕНДУ!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


            // var ordinal = d3.scaleOrdinal()
            //   .domain(fuel.map(function(d) {return d.id;}).sort())
            //   .range(d3.schemePaired);
            var n = carsOnClick.map(function (d) {
                    return d.id;
                }).length / 1.5;
            var itemWidth = 25;
            var itemHeight = 170;

            var svgLegend = d3.select("#legend svg");

            var button = d3.select("#legend");

            button = document.createElement("button");

            var legend = svgLegend.selectAll(".legend")
                .data(carsOnClick)
                .enter()
                .append("g")
                .attr("transform", function (d, i) {
                    return "translate(" + Math.floor(i / n) * itemHeight + "," + i % n * itemWidth + ")";
                })
                .attr("class", "legend checked");

            var rects = legend.append('rect').attr("class", "rect")
                .attr("width", 15)
                .attr("height", 15);
                // .attr("fill", function (d, i) {
                //     return z(d.id);
                // });

            var text = legend.append('text')
                .attr("x", 18)
                .attr("y", 12)
                .text(function (d) {
                    return d.id;
                });

            legend.on("click", function(d) {
                var item = d3.select(this);

                var checked_new = !item.classed("checked");
                item.classed("checked", checked_new);

                if (checked_new) addLine(d.id);
                else removeLine(d.id);
            });


            legend.on("mouseover", function (d) {
                d3.selectAll(".fuel_line")._groups[0].forEach(function (d) {
                    d.style.opacity = 0.1
                })
                document.getElementById(d.id).style.opacity = 1;
            })
                .on("mouseout", function (d) {
                    d3.selectAll(".fuel_line")._groups[0].forEach(function (d) {
                        d.style.opacity = 0.5
                    })
                })

            d3.selectAll(".fuel_line").on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 1);

                var colorList = [];
                div.html(d.id)
                    .style("left", (d3.event.pageX + 30) + "px")
                    .style("top", (d3.event.pageY - 28) + "px")

            })
                .on("mouseout", function (d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            d3.select("#deleteBigLinePlot").on("click", function () {
                emptyLines();
                //applying opacity to the legend to mark that the lines were deleted. It will allow to rename them later.

                legend.classed("checked", false);
            });

            window.removeLine = function(line_id){
                fuelFiltered = fuelFiltered.filter(function (d) {
                    return line_id != d;
                });
                redrawLines();
            };

            window.addLine = function(line_id){
                fuelFiltered.push(line_id);
                redrawLines();
            };

            window.emptyLines = function() {
                emptyArray(fuelFiltered);
                redrawLines();
            };

            function redrawLines() {
                carsOnClick = fuel.filter(function (d) {
                    return fuelFiltered.indexOf(d.id.replace(/\s+/g, ' ')) > -1;
                });

                y.domain([
                    0,
                    d3.max(carsOnClick, function (c) {
                        return d3.max(c.values, function (d) {
                            return d.number;
                        });
                    })
                ]);

                z.domain(carsOnClick.map(function (c) {
                    return c.id;
                }));

                svg.select(".axis.x")
                    .call(d3.axisBottom(x).tickFormat(multiFormat));

                //Update Y axis
                svg.select(".axis.y")
                    .transition()
                    .duration(1000)
                    .call(d3.axisLeft(y));

                var carsUpd = g.selectAll("g.car")
                    .data(carsOnClick, function (d) {
                        return d.id
                    });


                var carsEnter = carsUpd.enter()
                    .append("g")
                    .attr("class", "car");

                carsEnter
                    .append("path")
                    .attr("class", "fuel_line")
                    .style("opacity", .5)
                    .attr("id", function (d) {
                        return d.id
                    })
                    .style("z-index", "0.5");

                carsEnter.merge(carsUpd)
                    .selectAll("path")
                    .transition()
                    .duration(1000)
                    .attr("d", function (d) {
                        return line(d.values)
                    })
                    .style("stroke", function (d) {
                        return z(d.id)
                    });

                carsUpd
                    .exit()
                    .remove();
            }
        });
}


function type(d, _, columns) {
    var parseTime = d3.timeParse("%Y-%m");

    d.date = parseTime(d.date);
    for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
    return d;
}

function substringMatcher(strs) {
    return function findMatches(q, cb) {
        var matches, substringRegex;

        // an array that will be populated with substring matches
        matches = [];

        // regex used to determine if a string contains the substring `q`
        var substrRegex = new RegExp(q, 'i');

        // iterate through the pool of strings and for any string that
        // contains the substring `q`, add it to the `matches` array
        $.each(strs, function (i, str) {
            if (substrRegex.test(str)) {
                matches.push(str);
            }
        });

        cb(matches);
    };
};

function emptyArray(arr) {
    arr.splice(0, arr.length);
}

