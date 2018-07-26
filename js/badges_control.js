function badges_control() {

    var query = []
        , on_change_counter = 0
        , dispatcher = d3.dispatch("change")
        , color_fields = []
        , display_value_dictionary = {}
        ;

    function my(selection) {
        selection.each(function() {
            var container = d3.select(this);
            
            // var regions_container = container.select("#regions_container");
            // var brand_container = container.select("#brands_container");

            function update() {
                // var data = badgesFromQuery(query);
                if (!query) query = [];

                var rows_join = container
                    .selectAll("div.badge-row")
                    .data(query, function(f){return f.field});

                var rows_enter = rows_join
                    .enter()
                    .append("div")
                    .attr("class", "row badge-row")
                    .classed("order-colored-items", function(f){return color_fields.indexOf(f.field) >=0 });

                rows_join.exit().remove();

                var rows_update = rows_enter
                    .merge(rows_join);

                var items_join = rows_update
                    .selectAll("div.badge-item")
                    .data(function(f){return f.values}, function(d){return d});

                items_join.exit().remove();

                var items_enter = items_join
                    .enter()
                    .append("div")
                    .attr("class", "badge-item")
                    .text(function(d){
                        var filter = d3.select(this.parentNode).datum();
                        if (display_value_dictionary[filter.field]) return display_value_dictionary[filter.field][d];
                        return d;
                    })
                    .on("click", function(d) {
                        var filter = d3.select(this.parentNode).datum();
                        var change = {field: filter.field, value: d};
                        dispatcher.call("change", this, change);
                    });

                return my;
            }

            my.update = update;
            update();
        });
    }

    // function badgesFromQuery(query) {
    //     if (!query) query = [];
    //
    //     var result = {};
    //
    //     query.forEach(function(filter) {
    //
    //
    //     });
    //    
    //    
    //     console.log("query");
    //     console.log(query);
    //
    //     var query_region = query.filter(function(d){return d.field === "region"})[0];
    //     var query_brand = query.filter(function(d){return d.field === "brand"})[0];
    //
    //     if (query_region) {
    //         result.region = query_region.values.map(function (id) {
    //             var r = region_utils.REGION_BY_CODE[id];
    //             return {
    //                 short_name: r.short_name,
    //                 id: r.code
    //             }
    //         });
    //     } else {
    //         result.region = [];
    //     }
    //
    //     if (query_brand) {
    //         result.brand = query_brand.values.map(function(pr) {
    //             return {name: pr, id: pr}
    //         })
    //
    //     } else {
    //         result.brand = [];
    //     }
    //
    //     return result;
    // }

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

    my.color_fields = function(value) {
        if (!arguments.length) return color_fields;
        color_fields = value;
        return my;
    };

    my.display_value_dictionary = function(value) {
        if (!arguments.length) return display_value_dictionary;
        display_value_dictionary = value;
        return my;
    };

    return my;
}
