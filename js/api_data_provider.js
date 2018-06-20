var data_provider = (function() {
    var module = {};
    
    const API_HOST = "http://localhost:5000";
    

    module.getDailyData = function(cb) {
        return d3.json(API_HOST +  "/api/timeseries/total", function(err, data){
            if (err) return cb(err);

            data.forEach(function(row){row.d_reg = new Date(row.d_reg)});
            return cb(err, data);
        });
    };
    
    return module;
})();