function small_multiples() {

    var items
        , create_item = noop
        , update_item = noop
        , item_object_generator = noop
        , charts = []
        , parent_container
        ;

    function my(selection) {
        selection.each(function() {

            parent_container = d3.select(this);

            var item_containers = parent_container
                .selectAll("div.small_multiples_item")
                .data(items, function(d){return d.key})
                .enter()
                .append("div")
                .attr("class", "small_multiples_item");

            item_containers
                .append("h3")
                .text(function(d){return d.region.short_name});

            var svgs = item_containers
                .append("svg")
                .attr("class", "smallchart")
                .attr("width", "100%")
                .attr("data-aspect-ratio", "0.05")
                .attr("data-min-height", "50");

            item_containers
                .each(function(d, i) {
                    this.__chart__ = smallchart()
                        .data(d.timeseries)
                        .varName("n");

                    d3.select(this).select("svg").call(this.__chart__);
                });

            function update() {
                var join_selection = parent_container
                    .selectAll("div.small_multiples_item")
                    .data(items, function(d){return d.key})
                    .each(function(d, i){
                        console.log(d);

                        this.__chart__
                            .data(d.timeseries)
                            .update();

                    });

                return my;
            }

            my.update = update;
        });
    }

    my.items = function(value) {
        if (!arguments.length) return items;
        items = value;
        return my;
    };

    // my.create_item = function(value) {
    //     if (!arguments.length) return create_item;
    //     create_item = value;
    //     return my;
    // };
    //
    // my.update_item = function(value) {
    //     if (!arguments.length) return update_item;
    //     update_item = value;
    //     return my;
    // };

    // my.item_object_generator = function(value) {
    //     if (!arguments.length) return item_object_generator;
    //     item_object_generator = value;
    //     return my;
    // };


    function noop() {}

    return my;
}
