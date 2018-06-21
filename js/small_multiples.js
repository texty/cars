function small_multiples() {

    var data
        , create_item = noop
        , update_item = noop
        ;

    function my(selection) {
        selection.each(function(d) {

            var container = d3.select(this);
            
            var items = container
                .selectAll("div.small_multiples_item")
                .data(data)
                .enter()
                .append("div")
                .attr("class", "small_multiples_item")
                .each(function(d){
                    console.log("draw single item chart");
                    d3.select(this).call(create_item);
                });

            function update() {
                items
                    .each(function(d){
                        console.log("redraw single item chart");
                        d3.select(this).call(update_item);
                    });

                return my;
            }

            my.update = update;
        });
    }

    my.data = function(value) {
        if (!arguments.length) return data;
        data = value;
        return my;
    };

    my.create_item = function(value) {
        if (!arguments.length) return create_item;
        create_item = value;
        return my;
    };

    my.update_item = function(value) {
        if (!arguments.length) return update_item;
        update_item = value;
        return my;
    };
    
    function noop() {}

    return my;
}
