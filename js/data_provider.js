var data_provider = (function() {
    var module = {};
    
    var __data__;
    var __daily_data__;

    // var retrieveData = function(cb) {
    //     if (__data__) cb(__data__);
    //
    //     d3.csv("data/main_grouped.csv", function(err, data) {
    //         __data__ = data;
    //         return cb(err, data);
    //     });
    // };

    var retrieveDailyData = function(cb) {
        if (__daily_data__) cb(__daily_data__);

        d3.csv("data/daily.csv", function(err, data) {
            __daily_data__ = data;
            return cb(err, data);
        });
    };

    // module.getCars = function(query, cb) {
    //     return retrieveData(function(err, data) {
    //         if (err) throw err;
    //
    //         //тут у нас точно є дані
    //         // debugger;
    //         if (!query) return cb(data);
    //
    //         var queryFilter = function(obj) {
    //             return keyFilter(obj, "producer", query.producer)
    //                 // && keyFilter(obj, "region_code", query.region_code)
    //                 && keyFilter(obj, "model", query.model)
    //                 && keyFilter(obj, "make_year", query.make_year)
    //                 && keyFilter(obj, "color", query.color)
    //                 && keyFilter(obj, "kind", query.kind)
    //                 && keyFilter(obj, "fuel", query.fuel)
    //         };
    //         debugger;
    //         var filtered = data.filter(queryFilter);
    //         return cb(filtered);
    //     });
    // };
    
    module.getDailyData = function(cb) {
        return retrieveDailyData(function(err, data) {
            if (err) throw err;

            return cb(data);
        });
    };


    function keyFilter(obj, key, values) {
        if (!values) return true;
        return values.indexOf(obj[key]) >=0;
    }

    return module;
})();