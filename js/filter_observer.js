var filter_observer = (function() {
    var module = {}
        , filters = {}
        , query = {}

        , on_change_counter = 0
        , dispatcher = d3.dispatch("change")


        ;




    
    function onChange(filter_id) {
        console.log("Filters changed!!!!!!!!!");
        console.log(filter_id);

        // get new data
        // initiate chart redraw

        query = generateQuery();
        dispatcher.call("change", this, query);
    }

    module.addFilter = function(filter, filter_id) {
        if (!arguments.length) return;
        filters[filter_id] = filter;
        filter.onChange(function(){return onChange(filter_id)});

        return module;
    };

    function generateQuery() {
        var query = {};

        Object.keys(filters).forEach(function(filter_id){
            var filter = filters[filter_id];
            if (allSelected(filter.items())) return;

            query[filter_id] = filter
                .items()
                .filter(function(d) {return d.checked})
                .map(function (d) { return d.id});
        });

        return query;
    }

    module.onChange = function(value) {
        if (!arguments.length) return module;
        dispatcher.on("change." + ++on_change_counter, value);
        return module;
    };

    function allSelected(data) {
        return data.every(function(d){return !d.checked}) || data.every(function(d){return d.checked})
    }

    function noop() {}

    return module;
})();