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
    
    module.getDailyData = function(cb) {
        return retrieve("daily", d3.csv, "data/daily.csv", function(err, data) {
            var filled = fillDates(data);

            filled.forEach(function(row){
                row.d_reg = new Date(row.d_reg);
                row.n = +row.n;
            });

            return cb(err, filled);
        })
    };

    module.getProducersData = function(cb) {
        return retrieve("producers", d3.csv, "data/producers.csv", function(err, data) {
            data.forEach(function(row) {
                row.n = +row.n;
            });

            return cb(err, data);
        });
    };

    module.getRegionsData = function(cb) {
        return retrieve("regions", d3.csv, "data/regions.csv", function(err, data) {
            data.forEach(function(row) {
                row.n = +row.n;
            });

            return cb(err, data);
        });
    };

    function fillDates(sorted) {
        if (sorted.length < 3) return sorted;

        var extent = d3.extent(sorted, function(d){return d.d_reg});
        var sequence = datesInRange(extent[0], extent[1]);
        var idx = 0;
        return sequence.map(function(date_str){
            if (date_str === sorted[idx].d_reg) return sorted[idx++];
            return {d_reg: date_str, n:0}
        });
    }

    function addDays(date_str, n) {
        var date = moment.utc(date_str);
        date.add(1, 'days');
        return date.toISOString().substr(0, 10);
    }

    function datesInRange(min_str, max_str) {
        var date_str = min_str;
        var result = [];

        while (date_str <= max_str) {
            result.push(date_str);
            date_str = addDays(date_str, 1);
        }

        return result;
    }

    return module;
})();