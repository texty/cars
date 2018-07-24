var data_provider = (function() {
    var module = {};
    
    const API_HOST = "http://localhost:5000";
    // const API_HOST = "http://api-x32.texty.org.ua";

    // Повинні бути понеділками!!!!
    const dates_extent = ['2016-12-26', '2018-03-05'];
    const all_possible_mondays = datesInRange(dates_extent[0], dates_extent[1]);


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

    var getExtentData_xhr = {};
    module.getExtentData = function(field, query, cb) {
        if (getExtentData_xhr[field]) getExtentData_xhr[field].abort();

        var query_str = encodeURI(JSON.stringify(query));

        getExtentData_xhr[field] = cached_fetch_json(API_HOST + "/api/extent/" + field + "?json=" + query_str , function(err, data){
            if (err) throw err;
            
            var result = data[0];
            result.empty = result.total - result.nonempty;
            
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

        getTimeSeriesByQueryByRegion_xhr = cached_fetch_json(API_HOST +  "/api/timeseries/query?json=" + query_str, function(err, data){
            if (err) throw err;

            data.total = mapTimeseriesToObject(data.total);

            Object.keys(data.by_region).forEach(function(region) {
                data.by_region[region] = mapTimeseriesToObject(data.by_region[region]);
            });

            data.by_region = Object.keys(data.by_region).map(function(region) {
                return {
                    region: region_utils.REGION_BY_CODE[region],
                    timeseries: data.by_region[region],
                    total: d3.sum(data.by_region[region], function(obj) {return obj.n})
                }
            });

            data.by_region.sort(function(a,b){return b.total - a.total});

            return cb(err, data);
        });

        return;
    };

    var getTimeSeriesByQueryByRegionByBrand_xhr;
    module.getTimeSeriesByQueryByRegionByBrand = function(query, cb) {
        if (getTimeSeriesByQueryByRegionByBrand_xhr) getTimeSeriesByQueryByRegionByBrand_xhr.abort();

        var query_str = encodeURI(JSON.stringify(query));

        getTimeSeriesByQueryByRegionByBrand_xhr = cached_fetch_json(API_HOST +  "/api/timeseries/queries?json=" + query_str, function(err, data){
            if (err) throw err;

            Object.keys(data.total).forEach(function(brand){
               data.total[brand] = mapTimeseriesToObject(data.total[brand]);
            });

            Object.keys(data.by_region).forEach(function(region) {
                Object.keys(data.by_region[region]).forEach(function (brand) {
                    data.by_region[region][brand] = mapTimeseriesToObject(data.by_region[region][brand]);
                });
            });

            return cb(err, data);
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
            return sumFunction(obj, rest.map(function(arr) {return arr[i]}));
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

    function mapTimeseriesToObject(timeseries) {
        return timeseries.map(function(n,i){
            return {
                monday: new Date(all_possible_mondays[i]),
                n: n
            }
        })
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