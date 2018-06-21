var data_provider = (function() {
    var module = {};
    
    const API_HOST = "http://localhost:5000";
    
    const region_by_code = {
        "80": {name: "Київ", code: "80"},
        "12": {name: "Дніпропетровська область", code: "12"},
        "51": {name: "Одеська область", code: "51"},
        "32": {name: "Київська область", code: "32"},
        "63": {name: "Харківська область", code: "63"},
        "46": {name: "Львівська область", code: "46"},
        "14": {name: "Донецька область", code: "14"},
        "23": {name: "Запорізька область", code: "23"},
        "05": {name: "Вінницька область", code: "05"},
        "53": {name: "Полтавська область", code: "53"},
        "71": {name: "Черкаська область", code: "71"},
        "68": {name: "Хмельницька область", code: "68"},
        "18": {name: "Житомирська область", code: "18"},
        "26": {name: "Івано-Франківська область", code: "26"},
        "48": {name: "Миколаївська область", code: "48"},
        "56": {name: "Рівненська область", code: "56"},
        "07": {name: "Волинська область", code: "07"},
        "61": {name: "Тернопільська область", code: "61"},
        "35": {name: "Кіровоградська область", code: "35"},
        "59": {name: "Сумська область", code: "59"},
        "74": {name: "Чернігівська область", code: "74"},
        "65": {name: "Херсонська область", code: "65"},
        "21": {name: "Закарпатська область", code: "21"},
        "44": {name: "Луганська область", code: "44"},
        "73": {name: "Чернівецька область", code: "73"},
        "01": {name: "АР Крим", code: "01"},
        "85": {name: "Севастополь", code: "85"}
    };
    
    Object.keys(region_by_code).forEach(function(code) {
        var val = region_by_code[code];
        val.short_name = val.name.replace(" область", "");
    });
    
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

    module.getTimeSeriesByQueryByRegion = function(query, cb) {
        var json_str = JSON.stringify(query);

        var query_str = encodeURI(json_str);

        return d3.json(API_HOST +  "/api/timeseries/by_region/query?json=" + query_str, function(err, data){
            if (err) return cb(err);

            var nested = d3.nest()
                .key(function(d){return d.code})
                .rollup(function(leaves) {
                    var filled = fillDates(leaves);
                    filled.forEach(function(row){
                        row.d_reg = new Date(row.d_reg);
                        row.n = +row.n;
                    });
                    return filled;
                })
                .entries(data);

            nested.forEach(function(d){
                d.region = region_by_code[d.key];
                d.timeseries = d.value;
                delete d.value;

                d.total = d3.sum(d.timeseries, function(obj){return obj.n});
            });

            nested.sort(function(a,b){return b.total - a.total});

            console.log(nested);

            return cb(err, nested);
        });
    };

    return module;
})();