function badges_control() {

    var query = []
        , on_change_counter = 0
        , dispatcher = d3.dispatch("change")
        ;

    function my(selection) {
        selection.each(function() {
            var container = d3.select(this);
            
            var regions_container = container.select("#regions_container");
            var brand_container = container.select("#brands_container");

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

                var brand_join = brand_container
                    .selectAll("div.badge-row")
                    .data(data.brand, function(d) {return d.id});

                var brands_enter = brand_join
                    .enter()
                    .append("div")
                    .attr("class", "badge-row row countable");

                brands_enter
                    .append("div")
                    .attr("class", "badge-item")
                    .text(function(d){return d.name});

                brand_join.exit().remove();

                brand_container
                    .selectAll("div.badge-item")
                    .on("click", function(d) {
                        dispatcher.call("change", this, {brand: d});
                    });



                return my;
            }

            my.update = update;
            update();
        });
    }

    function badgesFromQuery(query) {
        if (!query) query = [];

        var result = {};

        var query_region = query.filter(function(d){return d.field === "region"})[0];
        var query_brand = query.filter(function(d){return d.field === "brand"})[0];

        if (query_region) {
            result.region = query_region.values.map(function (id) {
                var r = region_utils.REGION_BY_CODE[id];
                return {
                    short_name: r.short_name,
                    id: r.code
                }
            });
        } else {
            result.region = [];
        }

        if (query_brand) {
            result.brand = query_brand.values.map(function(pr) {
                return {name: pr, id: pr}
            })

        } else {
            result.brand = [];
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
