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



    var getFieldData_xhr = {};
    module.getFieldData = function(field, query, cb) {
        if (getFieldData_xhr[field]) getFieldData_xhr[field].abort();

        var query_str = encodeURI(JSON.stringify(query));

        getFieldData_xhr[field] = cached_fetch_json(API_HOST + "/api/field/" + field + "?json=" + query_str , function(err, data){
            if (err) throw err;

            data.forEach(function(row){
                row.n = +row.n;
                row.id = row[field];
                row.label = row.id;
                row.badge = +row.n;
            });

            return cb(err, data);
        });
    };

    var getFieldHisto_xhr = {};
    module.getFieldHisto = function(field, query, cb) {
        if (getFieldHisto_xhr[field]) getFieldHisto_xhr[field].abort();

        var query_str = encodeURI(JSON.stringify(query));

        getFieldHisto_xhr[field] = cached_fetch_json(API_HOST + "/api/histo/" + field + "?json=" + query_str , function(err, data){
            if (err) throw err;
            console.log(data)

            var result = {};
            // debugger;

            if (data.length && data[0][field] === null) {
                result.empty = data[0];
                data = data.slice(1);
            }

            result.main = fillWithZeros(data, field, 100);
            console.log(result);
            return cb(err, result);
        });
    };

    var getRegionsData_xhr;
    module.getRegionsData = function(field, query, cb) {
        //todo ignoring field parameter. We need it only for shared interface
        if (getRegionsData_xhr) getRegionsData_xhr.abort();

        var query_str = encodeURI(JSON.stringify(query));
        
        getRegionsData_xhr = cached_fetch_json(API_HOST + "/api/regions?json=" + query_str , function(err, data){
            if (err) throw err;

            data.forEach(function(row){
                row.n = +row.n;
                row.id = row.code;
                row.label = row.short_name;
                row.badge = +row.n;
                delete row.code;
            });

            return cb(err, data);
        });
    };
    

    var getTimeSeriesByQueryByRegion_xhr;
    module.getTimeSeriesByQueryByRegion = function(query, cb) {
        if (getTimeSeriesByQueryByRegion_xhr) getTimeSeriesByQueryByRegion_xhr.abort();

        var query_str = encodeURI(JSON.stringify(query));

        getTimeSeriesByQueryByRegion_xhr = cached_fetch_json(API_HOST +  "/api/timeseries/by_region/query?json=" + query_str, function(err, data){
            if (err) throw err;

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

    function fillWithZeros(ordered_data, varName, step) {
        var extent = d3.extent(ordered_data, function(d){return d[varName]});
// debugger;
        var repaired = [];
        var idx = 0;

        var val;

        for (val = extent[0]; val <= extent[1]; val += step) {
            if (ordered_data[idx][varName] === val) {
                repaired.push(ordered_data[idx]);
                idx++;
            } else {
                var obj = {n: 0};
                obj[varName] = val;
                repaired.push(obj);
            }
        }

        return repaired;
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