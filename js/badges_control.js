function badges_control() {

    var query = {}
        , on_change_counter = 0
        , dispatcher = d3.dispatch("change")
        ;

    function my(selection) {
        selection.each(function() {
            var container = d3.select(this);
            
            var regions_container = container.select("#regions_container");
            var producer_model_container = container.select("#producer_model_container");

            function update() {
                var data = badgesFromQuery(query);

                var regions_join = regions_container
                    .selectAll("div.badge-item")
                    .data(data.region, function(d) {return d.id});

                var regions_enter = regions_join
                    .enter()
                    .append("div")
                    .attr("class", "badge-item")
                    .text(function(d){return d.short_name});

                regions_join.exit().remove();

                regions_container
                    .selectAll("div.badge-item")
                    .on("click", function(d) {
                        dispatcher.call("change", this, {region: d});
                    });
                    

                //
                //

                var producers_join = producer_model_container
                    .selectAll("div.badge-row")
                    .data(data.producer, function(d) {return d.id});

                var producers_enter = producers_join
                    .enter()
                    .append("div")
                    .attr("class", "badge-row row countable");

                producers_enter
                    .append("div")
                    .attr("class", "badge-item")
                    .text(function(d){return d.name});

                producers_join.exit().remove();

                producers_join
                    .selectAll("div.badge-item")
                    .on("click", function(d) {
                        dispatcher.call("change", this, {producer: d});
                    });



                return my;
            }

            my.update = update;
            update();
        });
    }

    function badgesFromQuery(query) {
        if (!query) query = {};

        var result = {};

        if (query.region) {
            result.region = query.region.map(function (id) {
                var r = region_utils.REGION_BY_CODE[id];
                return {
                    short_name: r.short_name,
                    id: r.code
                }
            });
        } else {
            result.region = [];
        }

        if (query.producer) {
            result.producer = query.producer.map(function(pr) {
                return {name: pr, id: pr}
            })

        } else {
            result.producer = [];
        }

        return result;
    }

    my.query = function(value) {
        if (!arguments.length) return query;
        query = value;
        return my;
    };

    my.onChange = function(value) {
        if (!arguments.length) return;
        dispatcher.on("change." + ++on_change_counter, value);
        return my;
    };

    return my;
}
