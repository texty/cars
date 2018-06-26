var data_provider = (function() {
    var module = {};
    
    var __datasets__ = {};
    
    function retrieve(name, method, param, cb) {
        if (__datasets__[name]) return __datasets__[name];

        return method(param, function(err, data){
            __datasets__[name] = data;
            return cb(err, data)
        })
    }
    
    module.getTimeSeriesTotal = function(cb) {
        return retrieve("daily", d3.csv, "data/daily.csv", function(err, data) {
            var filled = fillDates(data);

            filled.forEach(function(row){
                row.monday = new Date(row.monday);
                row.n = +row.n;
            });

            return cb(err, filled);
        })
    };

    module.getProducersData = function(cb) {
        return retrieve("producers", d3.csv, "data/producers.csv", function(err, data) {
            data.forEach(function(row) {
                row.n = +row.n;
                row.id = row.producer;
            });

            return cb(err, data);
        });
    };

    module.getRegionsData = function(cb) {
        return retrieve("regions", d3.csv, "data/regions.csv", function(err, data) {
            data.forEach(function(row) {
                row.n = +row.n;
                row.id = row.code; 
                delete row.code;
            });

            return cb(err, data);
        });
    };

    module.getTimeSeriesByQuery = function(cb) {
        
        
        
    };
    
    


    return module;
})();