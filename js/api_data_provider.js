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
    module.getRegionsData = function(cb) {
        if (getRegionsData_xhr) getRegionsData_xhr.abort();
        getRegionsData_xhr = d3.json(API_HOST +  "/api/regions", function(err, data){
            if (err) return cb(err);

            data.forEach(function(row){
                row.n = +row.n;
                row.id = row.code;
                delete row.code;
            });

            return cb(err, data);
        });
    };

    var getProducersData_cache = {};
    var getProducersData_xhr;
    module.getProducersData = function(query, cb) {
        if (getProducersData_xhr) getProducersData_xhr.abort();

        var query_str = encodeURI(JSON.stringify(query));
        if (getProducersData_cache[query_str]) return cb(null, getProducersData_cache[query_str]);
        
        getProducersData_xhr = d3.json(API_HOST +  "/api/producers?json=" + query_str, function(err, data){
            if (err) return cb(err);

            data.forEach(function(row){
                row.n = +row.n;
                row.id = row.producer;
            });

            getProducersData_cache[query_str] = data;
            return cb(err, data);
        });
    };

    var getModelsData_xhr;
    module.getModelsData = function(query, cb) {
        if (getModelsData_xhr) getModelsData_xhr.abort();
        var query_str = encodeURI(JSON.stringify(query));

        getModelsData_xhr = d3.json(API_HOST +  "/api/models?json=" + query_str, function(err, data){
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

        getYearsData_xhr = d3.json(API_HOST +  "/api/make_years?json=" + query_str, function(err, data){
            if (err) return cb(err);

            data.forEach(function(row){
                row.n = +row.n;
                row.id = row.make_year;
            });

            return cb(err, data);
        });
    };

    var getTimeSeriesByQueryByRegion_xhr;
    var getTimeSeriesByQueryByRegion_cache = {};
    module.getTimeSeriesByQueryByRegion = function(query, cb) {
        if (getTimeSeriesByQueryByRegion_xhr) getTimeSeriesByQueryByRegion_xhr.abort();

        var query_str = encodeURI(JSON.stringify(query));

        if (getTimeSeriesByQueryByRegion_cache[query_str]) return cb(null, getTimeSeriesByQueryByRegion_cache[query_str]);

        getTimeSeriesByQueryByRegion_xhr = d3.json(API_HOST +  "/api/timeseries/by_region/query?json=" + query_str, function(err, data){
            if (err) return cb(err);

            var by_region = d3.nest()
                .key(function(d){return d.code})
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
            getTimeSeriesByQueryByRegion_cache[query_str] = result;
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

        regions.forEach(function(region_code){
            var region_data = by_region.filter(function(obj){return region_code === obj.key})[0];
            if (!region_data) {
                region_data = {
                    key: region_code,
                    value: fillDates([], dates_extent)
                };

                region_data.value.forEach(function(row){
                    row.monday = new Date(row.monday);
                });

                by_region.push(region_data);
            }
        });
    }

    return module;
})();