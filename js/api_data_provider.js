var data_provider = (function() {
    var module = {};
    
    const API_HOST = "http://localhost:5000";
    
    module.getTimeSeriesTotal = function(cb) {
        return d3.json(API_HOST +  "/api/timeseries/total", function(err, data){
            if (err) return cb(err);

            var filled = fillDates(data);

            filled.forEach(function(row){
                row.d_reg = new Date(row.d_reg);
                row.n = +row.n;
            });
            return cb(err, filled);
        });
    };

    module.getProducersData = function(cb) {
        return d3.json(API_HOST +  "/api/producers", function(err, data){
            if (err) return cb(err);

            data.forEach(function(row){
                row.n = +row.n;
                row.id = row.producer;
            });

            return cb(err, data);
        });
    };

    module.getRegionsData = function(cb) {
        return d3.json(API_HOST +  "/api/regions", function(err, data){
            if (err) return cb(err);

            data.forEach(function(row){
                row.n = +row.n;
                row.id = row.code;
                delete row.code;
            });

            return cb(err, data);
        });
    };

    module.getTimeSeriesByQuery = function(query, cb) {
        var json_str = JSON.stringify(query);

        var query_str = encodeURI(json_str);

        return d3.json(API_HOST +  "/api/timeseries/query?json=" + query_str, function(err, data){
            if (err) return cb(err);

            var filled = fillDates(data);

            filled.forEach(function(row){
                row.d_reg = new Date(row.d_reg);
                row.n = +row.n;
            });
            return cb(err, filled);
        });
    };


    return module;
})();