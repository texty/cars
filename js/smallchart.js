function smallchart() {

    var varName
        , data = []
        , minY
        , maxY
        , maxStep
        , yFormat = function(v) {return v}
        , yTickValues
        , snapFunction
        , sticky
        , drawMode
        , showTips
        , pension_year
        , pension_year_line
        , x

        , minValueY
        , maxValueY
        , circleRadius

        ;

    function my(selection) {
        selection.each(function(d) {

            var svg = d3.select(this);
            var w = svg.node().getBoundingClientRect().width;
            var mh = +svg.attr("data-min-height");
            var h = Math.max(mh, w * (+svg.attr("data-aspect-ratio")));

            circleRadius = d3.select("body").classed("xs") ? 12 : 5;

            var margin = {top: 5, right: 15, bottom: 15, left: 20}
                , width = w - margin.left - margin.right
                , height = h - margin.top - margin.bottom
                , g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                ;
            svg.attr("height", h);

            x = d3.scaleLinear()
                .range([0, width]);

            var y = d3.scaleLinear()
                .range([height, 0]);

            var line = d3.line()
                .x(function(d) { return x(d.year)})
                .y(function(d) { return y(d[varName])});

            var area = d3.area()
                .x(function(d) {return x(d.year)})
                .y0(y(0))
                .y1(function(d) {return y(d[varName])});

            var all = data.concat(future);

            var future_start = [data[data.length - 1]].concat(future);


            x.domain(d3.extent(all, function(d) {return d.year}));

            if (!minY) minY = 0;
            if (!maxY) maxY = d3.max(all, function(d) {return d[varName]});

            if (!minValueY) minValueY = minY;
            if (!maxValueY) maxValueY = maxY;

            y.domain([minY, maxY]);

            var xAxis = d3.axisBottom(x)
                .ticks(4)
                .tickSizeOuter(0)
                .tickSizeInner(-height)
                .tickPadding(5)
                .tickFormat(d3.format("d"));

            var yAxis = d3.axisLeft(y)
                .ticks(3)
                .tickSizeOuter(0)
                .tickSizeInner(-width)
                .tickPadding(5);

            if (yFormat) yAxis.tickFormat(yFormat);
            if (yTickValues) yAxis.tickValues(yTickValues);

            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            g.append("g")
                .attr("class", "axis axis--y")
                .call(yAxis);


            var historical_area = g.append("path")
                .datum(data)
                .attr("class", "area historical")
                .attr("d", area);

            var historical_path = g.append("path")
                .datum(data)
                .attr("class", "line historical")
                .attr("d", line);

            var future_area = g.append("path")
                .datum(future_start)
                .attr("class", "area future")
                .attr("d", area);

            var future_path = g.append("path")
                .datum(future_start)
                .attr("class", "line future")
                .attr("d", line);

            var tip_g = g.append("g")
                .attr("class", "tip");

            var tip_rect = tip_g.append("rect")
                .attr("x", -22)
                .attr("y", -15)
                .attr("ry", 3)
                .attr("rx", 3)
                .attr("width", 25)
                .attr("height", 20);

            var tipText = tip_g.append("text").attr('text-anchor', "end");


            var x12 = x(pension_year);
            pension_year_line = g.append("line")
                .attr("class", "pension_year")
                .attr("y1", 0 - margin.top)
                .attr("y2", height + margin.bottom)
                .attr("x1", x12)
                .attr("x2", x12);


            // var handle_points_set = handlePoints.reduce(function(o,v) {o[v] = true; return o}, {});
            var circles = g.selectAll("circle.handle")
                .data(future)
                .enter()
                .append('circle')
                .attr("class", 'handle')
                .attr('cx', function(d) {return x(d.year)})
                .attr('cy', function(d) {return y(d[varName])})
                .attr('r', circleRadius)
                .call(d3.drag()
                    .on("drag", dragged)
                    .on("end", dragend)
                );

            if (drawMode) {
                var nodes = circles.nodes();
                var c_length = nodes.length;
                var section_width = d3.select(nodes[c_length - 1]).attr("cx") - d3.select(nodes[c_length - 2]).attr("cx");
                var x_margin = 5;

                var max_handle_dist = section_width/2 + x_margin;
            }

            function dragged(d, i) {

                // throw event to neighbour circle if pointer position is far from current circle
                if (drawMode) {
                    if (i < c_length - 1 && d3.event.x - x(d.year) > max_handle_dist) {
                        // we need to shift right
                        dragged.call(circles.nodes()[i + 1], circles.data()[i + 1], i + 1);
                        return;
                    }
                    else if (i > 0 && d3.event.x - x(d.year) < -max_handle_dist) {
                        // we need to shift left
                        dragged.call(circles.nodes()[i - 1], circles.data()[i - 1], i - 1);
                        return;
                    }
                }

                var v = y.invert(d3.event.y);
                v = minmax(v, minValueY, maxValueY);

                if (snapFunction) {
                    v = snapFunction(v);
                    d3.event.y = y(v);
                }

                if (maxStep) {
                    var v0 = future_start[0][varName];
                    var diff = v - v0;

                    v = diff > 0 ? Math.min(v, v0 + maxStep*(i+1)) : Math.max(v, v0 - maxStep*(i+1));
                    // d3.event.y = y(v);
                } else {
                    // d3.select(this).attr("cy", d3.event.y);
                }

                d3.event.y = y(v);
                d3.select(this).attr("cy", d3.event.y);

                if (sticky) {
                    var prev_val = d[varName];
                    var eps = v - prev_val;

                    for (var j=i+1; j < future.length; j++) {
                        var f_new = future[j][varName] + eps;
                        future[j][varName] = minmax(f_new, minValueY, maxValueY);
                    }
                }

                d[varName] = v;

                if (showTips) {
                    tip_g
                        .style("opacity", 1)
                        .translate([d3.select(this).attr('cx') - 10, d3.event.y]);

                    tipText.text(yFormat(v));
                    // .attr("x", )
                    // .attr("y", )
                    // .text(yFormat(v))
                }

                repair_data(i);
                update();
                svg.call(triggerEvent, 'change', {detail: {index: i}});
            }

            function dragend() {
                if (showTips) {
                    tip_g
                        .transition()
                        .duration(700)
                        .style("opacity", 0);
                }

                svg.call(triggerEvent, 'dragend');
            }

            function update() {
                future_path.attr("d", line);
                future_area.attr("d", area);
                circles.attr("cy", function(d){return y(d[varName])});
            }

            function repair_data(idx) {
                if (!maxStep) return;

                var idx_value = future[idx][varName];
                var previous_value, i, value;

                previous_value = idx_value;
                for (i = idx + 1; i < future.length; i++) {
                    value = future[i][varName];
                    if (Math.abs(value - previous_value) <= maxStep) break;

                    future[i][varName] = value - previous_value > 0 ? previous_value + maxStep : previous_value - maxStep;
                    previous_value = future[i][varName];
                }

                previous_value = idx_value;
                for (i = idx - 1; i >=0 ; i--) {
                    value = future[i][varName];
                    if (Math.abs(value - previous_value) <= maxStep) break;

                    future[i][varName] = value - previous_value > 0 ? previous_value + maxStep : previous_value - maxStep;
                    previous_value = future[i][varName];
                }
            }

            function triggerEvent(selection, name, e) {
                selection.each(function (d) {
                    d3.select(this).node().dispatchEvent(new CustomEvent(name, e));
                });
            }

            function minmax(v, min, max) {
                return Math.min(Math.max(v, min), max);
            }
        });
    }

    my.data = function(value) {
        if (!arguments.length) return data;
        data = value;
        return my;
    };

    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    my.varName = function(value) {
        if (!arguments.length) return varName;
        varName = value;
        return my;
    };

    my.future = function(value) {
        if (!arguments.length) return future;
        future = value;
        return my;
    };

    my.minY = function(value) {
        if (!arguments.length) return minY;
        minY = value;
        return my;
    };

    my.maxY = function(value) {
        if (!arguments.length) return maxY;
        maxY = value;
        return my;
    };

    my.minValueY = function(value) {
        if (!arguments.length) return minValueY;
        minValueY = value;
        return my;
    };

    my.maxValueY = function(value) {
        if (!arguments.length) return maxValueY;
        maxValueY = value;
        return my;
    };

    my.maxStep = function(value) {
        if (!arguments.length) return maxStep;
        maxStep = value;
        return my;
    };

    my.yFormat = function(value) {
        if (!arguments.length) return yFormat;
        yFormat = value;
        return my;
    };

    my.yTickValues = function(value) {
        if (!arguments.length) return yTickValues;
        yTickValues = value;
        return my;
    };

    my.snapFunction = function(value) {
        if (!arguments.length) return snapFunction;
        snapFunction = value;
        return my;
    };

    my.sticky = function(value) {
        if (!arguments.length) return sticky;
        sticky = value;
        return my;
    };

    my.drawMode = function(value) {
        if (!arguments.length) return drawMode;
        drawMode = value;
        return my;
    };

    my.showTips = function(value) {
        if (!arguments.length) return showTips;
        showTips = value;
        return my;
    };

    my.pension_year = function(value) {
        if (!arguments.length) return pension_year;
        pension_year = value;
        return my;
    };

    my.update_pension_year = function(value) {
        if (arguments.length) {
            pension_year = value;
        }

        var x12 = x(pension_year);
        pension_year_line.attr("x1", x12).attr("x2", x12);
        return my;
    };


    return my;
}
