var filter_chain = (function() {
    var module = {}
        , filters = []
        , query = []

        , on_change_counter = 0
        , dispatcher = d3.dispatch("change")
        ;



    function onChange(filter_position) {
        console.log("Filter " + filter_position + " changed!!!!!!!!!");

        filters.forEach(function(filter_object, index) {
            if (index <= filter_position ) return;

            var filters_for_query = filters.slice(0, index);
            filter_object.query = generateQuery(filters_for_query);

            filter_object.fetchNewData(filter_object.query);
        });

        query = generateQueryForAllFilters();
        dispatcher.call("change", this, query);
    }

    module.addFilter = function(filter_object) {
        if (!arguments.length) return;
        
        filters.push(filter_object);
        filter_object.position = filters.length - 1;

        filter_object.component.onChange(function(){return onChange(filter_object.position)});

        return module;
    };

    module.removeFilter = function(idx) {
        if (!arguments.length) return;
        filters.splice(idx, 1);
        filters.forEach(function(filter_object, index) {
            filter_object.position = index;
        });

        return module;
    };


    module.onChange = function(value) {
        if (!arguments.length) return module;
        dispatcher.on("change." + ++on_change_counter, value);
        return module;
    };
    
    module.triggerChange = function(index) {
        onChange(index);
        return module;  
    };

    module.getCurrentQuery = function() {
        return generateQueryForAllFilters();
    };

    function generateQueryForAllFilters() {
        return generateQuery(filters)
    }

    function generateQuery(filters_array) {
        var query = [];

        filters_array.forEach(function(filter_object) {
            var filter_query = generateFilterQuery(filter_object);

            if (filter_query) query.push(filter_query);
        });

        return query;
    }

    function generateFilterQuery(filter_object) {
        if (filter_object.type === "simple") {
            if (filter_object.verb === "in") {
                var data = filter_object.component.selected();

                if (!data.length) return null;

                return {
                    type: "simple",
                    verb: "in",
                    field: filter_object.field,
                    values: data
                }
            } else if (filter_object.verb === "between") {
                var extent = filter_object.component.selectedExtent();

                if (!extent.length) return null;

                return {
                    type: "simple",
                    verb: "between",
                    field: filter_object.field,
                    values: extent
                }

            } else throw "filter verb is unknown";

        } else if (filter_object.type === "combined") {
            return {
                type: "combined",
                filters: filter_object.component.getCombinedFilters()
            }
        } else throw "Filter type is unknown";
    }

    return module;
})();