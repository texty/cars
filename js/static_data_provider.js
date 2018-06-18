var data_provider = (function() {
    var module = {};
    
    var __datasets__ = {};
    
    function retrieve(name, method, param, cb) {
        if (__datasets__[name]) return __datasets__[name];

        return method(param, function(err, data){
            if (err) throw err;

            __datasets__[name] = data;
            return cb(data)
        })
    }
    
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
        return retrieve("daily", d3.csv, "data/daily.csv", function(data) {
            data.forEach(function(row){
                row.d_reg = new Date(row.d_reg);
                row.n = +row.n;
            });
            return cb(data)
        })
    };
    
    
    function keyFilter(obj, key, values) {
        if (!values) return true;
        return values.indexOf(obj[key]) >=0;
    }

    return module;
})();