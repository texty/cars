function range_control() {
    
    var container
        , context = {
            placeholder: "",
            histo_data: {empty:null, main:[]},
            id: "",
            varName: ""




        }
        , dispatcher = d3.dispatch("change")
        , on_change_counter = 0
        , minX, minY, maxX, maxY
        , main_area
        ;

    function my(selection) {
        selection.each(function(d) {
            context.varName = context.id;

            var container = d3.select(this)
                .append("div")
                .attr("class", "range-control");

            var header = container
                .append("span")
                .attr("class", "placeholder")
                .text(context.placeholder);

            var svg = container
                .append("svg")
                .attr("width", "100%")
                .attr("data-min-height", "100")
                .attr("data-aspect-ration", "0.5");

            var w = svg.node().getBoundingClientRect().width;
            var mh = +svg.attr("data-min-height");
            var h = Math.max(mh, w * (+svg.attr("data-aspect-ratio")));

            var margin = {top: 5, right: 15, bottom: 15, left: 20}
                , width = w - margin.left - margin.right
                , height = h - margin.top - margin.bottom
                , g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                ;
            svg.attr("height", h);

            var x = d3.scaleLinear()
                .range([0, width]);

            var y = d3.scaleLinear()
                .range([height, 0]);
            //
            // var line = d3.line()
            //     .x(function(d) { return x(d.monday)})
            //     .y(function(d) { return y(d[varName])})
            //     .curve(d3.curveStepAfter);

            var area = d3.area()
                .x(function(d) {return x(d[context.varName])})
                .y0(y(0))
                .y1(function(d) {return y(d.n)})
                .curve(d3.curveStepAfter);

            // x.domain(d3.extent(context.histo_data, function(d) {return d[varName]}));

            // if (!minY) minY = 0;
            // if (!maxY) maxY = d3.max(context.histo_data, function(d) {return d.n});

            // if (!minValueY) minValueY = minY;
            // if (!maxValueY) maxValueY = maxY;

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

            // if (yFormat) yAxis.tickFormat(yFormat);
            // if (yTickValues) yAxis.tickValues(yTickValues);
            // if (yTicks) yAxis.ticks(yTicks);

            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            g.append("g")
                .attr("class", "axis axis--y")
                .call(yAxis);

            main_area = g.append("path")
                .attr("class", "area main");

            var label = container
                .append("label")
                .attr("class", "form-check-label d-flex justify-content-between align-items-center");

            var empty_checkbox = label
                .append("input")
                .attr("type", "checkbox")
                .attr("class", "form-check-input")
                .attr("value", "");

            var check_text = label
                .append("span")
                .attr("class", "check-text")
                .text(function(d){return "Показувати пусті"});


            my.update = update;

            function update() {
                if (!minY) minY = 0;
                maxY = d3.max(context.histo_data.main, function(d) {return d.n});
                x.domain(d3.extent(context.histo_data.main, function(d) {return d[context.varName]}));
                y.domain([minY, maxY]);

                g.select("g.axis.axis--y").call(yAxis);
                g.select("g.axis.axis--x").call(xAxis);

                main_area
                    .datum(context.histo_data.main)
                    .transition()
                    .duration(500)
                    .attr("d", area);

                check_text.text("Показувати пусті (" + (context.histo_data.empty ? context.histo_data.empty.n : 0) + ")");

                return my;
            }
        });

    }

    my.placeholder = function(value) {
        if (!arguments.length) return context.placeholder;
        context.placeholder = value;
        return my;
    };

    my.id = function(value) {
        if (!arguments.length) return context.id;
        context.id = value;
        return my;
    };

    my.histo_data = function(value) {
        if (!arguments.length) return context.histo_data;
        context.histo_data = value;
        return my;
    };

    my.selectedExtent = function() {
        if (!context.histo_data.main.length) return [];
        return d3.extent(context.histo_data.main, function(d){return d[context.varName]});
    };

    my.onChange = function(value) {
        if (!arguments.length) return;
        dispatcher.on("change." + ++on_change_counter, value);
        return my;
    };

    return my;
}
