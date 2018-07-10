var data_provider = (function() {
    var module = {};
    
    const API_HOST = "http://localhost:5000";
    // const API_HOST = "http://api-x32.texty.org.ua";

    // Повинні бути понеділками!!!!
    const dates_extent = ['2017-01-02', '2018-03-05'];
    // const dates_extent = ['2017-01-03', '2018-03-06'];

    Object.keys(region_utils.REGION_BY_CODE).forEach(function(code) {
        var val = region_utils.REGION_BY_CODE[code];
        val.short_name = val.name.replace(" область", "");
    });


    var getRegionsData_xhr;
    module.getRegionsData = function(query, cb) {
        if (getRegionsData_xhr) getRegionsData_xhr.abort();

        var query_str = encodeURI(JSON.stringify(query));
        
        getRegionsData_xhr = cached_fetch_json(API_HOST + "/api/regions?json=" + query_str , function(err, data){
            if (err) return cb(err);

            data.forEach(function(row){
                row.n = +row.n;
                row.id = row.code;
                delete row.code;
            });

            return cb(err, data);
        });
    };

    var getProducersData_xhr;
    module.getProducersData = function(query, cb) {
        if (getProducersData_xhr) getProducersData_xhr.abort();

        var query_str = encodeURI(JSON.stringify(query));

        getProducersData_xhr = cached_fetch_json(API_HOST +  "/api/field/producer?json=" + query_str, function(err, data){
            if (err) return cb(err);

            data.forEach(function(row){
                row.n = +row.n;
                row.id = row.producer;
            });

            return cb(err, data);
        });
    };

    var getModelsData_xhr;
    module.getModelsData = function(query, cb) {
        if (getModelsData_xhr) getModelsData_xhr.abort();
        var query_str = encodeURI(JSON.stringify(query));

        getModelsData_xhr = cached_fetch_json(API_HOST +  "/api/field/model?json=" + query_str, function(err, data){
            if (err) return cb(err);

            data.forEach(function(row){
                row.n = +row.n;
                row.id = row.model;
            });

            return cb(err, data);
        });
    };

    var getYearsData_xhr;
    module.getYearsData = function(query, cb) {
        if (getYearsData_xhr) getYearsData_xhr.abort();
        var query_str = encodeURI(JSON.stringify(query));

        getYearsData_xhr = cached_fetch_json(API_HOST +  "/api/field/make_year?json=" + query_str, function(err, data){
            if (err) return cb(err);

            data.forEach(function(row){
                row.n = +row.n;
                row.id = row.make_year;
            });

            return cb(err, data);
        });
    };

    var getTimeSeriesByQueryByRegion_xhr;
    module.getTimeSeriesByQueryByRegion = function(query, cb) {
        if (getTimeSeriesByQueryByRegion_xhr) getTimeSeriesByQueryByRegion_xhr.abort();

        var query_str = encodeURI(JSON.stringify(query));

        getTimeSeriesByQueryByRegion_xhr = cached_fetch_json(API_HOST +  "/api/timeseries/by_region/query?json=" + query_str, function(err, data){
            if (err) return cb(err);

            var by_region = d3.nest()
                .key(function(d){return d.region})
                .rollup(function(leaves) {
                    var filled = fillDates(leaves, dates_extent);
                    filled.forEach(function(row){
                        row.monday = new Date(row.monday);
                        row.n = +row.n;
                    });
                    return filled;
                })
                .entries(data);

            fillRegions(by_region, query.region);
            
            by_region.forEach(function(d){
                d.region = region_utils.REGION_BY_CODE[d.key];
                d.timeseries = d.value;
                delete d.value;

                d.total = d3.sum(d.timeseries, function(obj){return obj.n});
            });
            var total = calculateTotal(by_region);

            by_region.sort(function(a,b){return b.total - a.total});

            var result = {
                by_region: by_region,
                total: total
            };
            return cb(err, result);
        });

        return;
    };




    function calculateTotal(by_region) {
        var array_of_arrays = by_region
            .map(function(region_data){ return region_data.timeseries });

        return sumArrays(array_of_arrays);
    }


    function sumArrays(array_of_arrays) {
        if (!array_of_arrays) return;
        if (array_of_arrays.length < 2) return array_of_arrays[0];

        var first = array_of_arrays[0];
        var rest = array_of_arrays.slice(1);

        return first.map(function(obj, i) {
            return sumFunction(obj, rest.map(function(arr) {return arr[i]} ));
        })
    }

    function sumFunction(first, rest) {
        return {
            monday: first.monday,
            n: first.n + d3.sum(rest, function(d){return d.n})
        }
    }

    function fillRegions(by_region, regions) {
        if (!regions || !regions.length) regions = Object.keys(region_utils.REGION_BY_CODE);

        regions.forEach(function(region){
            var region_data = by_region.filter(function(obj){return region === obj.key})[0];
            if (!region_data) {
                region_data = {
                    key: region,
                    value: fillDates([], dates_extent)
                };

                region_data.value.forEach(function(row){
                    row.monday = new Date(row.monday);
                });

                by_region.push(region_data);
            }
        });
    }

    var xhr_cache = {};
    function cached_fetch_json(uri, cb) {
        if (xhr_cache[uri]) return cb(null, JSON.parse(JSON.stringify(xhr_cache[uri])));
        
        return d3.json(uri, function(err, data) {
            if (err) throw err;
            
            xhr_cache[uri] = data;
            return cb(err, JSON.parse(JSON.stringify(data)));
        })
    }

    window.xhr_cache = xhr_cache;

    return module;
})();