var total_chart = smallchart()
    .varName("n");

var small_multiples_chart = small_multiples();

var regions_control = list_control()
    .id("region")
    .placeholder("Введіть область")
    .show_badges(true);
d3.select('#regions_control').call(regions_control);

var producers_control = list_control()
    .id("producer")
    .placeholder("Введіть марку")
    .show_badges(true);
d3.select('#producers_control').call(producers_control);

var models_control = list_control()
    .id("model")
    .placeholder("Введіть модель")
    .show_badges(true);
d3.select('#models_control').call(models_control);

var years_control = list_control()
    .id("make_year")
    .placeholder("Введіть рік випуску")
    .show_badges(true);
d3.select('#years_control').call(years_control);

filter_chain.addFilter({
    component: regions_control, verb: "in", type: "simple", field: "region",
    fetchNewData: function(query){
        data_provider.getRegionsData(query, function(err, regions) {
            if (err) throw err;

            var items = regions.map(function(d){
                return {label: d.name.replace(" область", ""), badge: d.n, id: d.id}
            });

            regions_control
                .items(items)
                .update();
        });
    }
});

filter_chain.addFilter({component: producers_control, verb: "in", type: "simple", field: "producer",
    fetchNewData: function(query){
        data_provider.getProducersData(query, function(err, producers) {
            if (err) throw err;

            var items = producers.map(function(d){
                return {label: d.producer, badge: d.n, id: d.producer}
            });

            producers_control
                .items(items)
                .update();
        });
    }
});

filter_chain.addFilter({component: models_control, verb: "in", type: "simple", field: "model",
    fetchNewData: function(query) {
        data_provider.getModelsData(query, function(err, data) {
            if (err) throw err;

            data.forEach(function(d){
                d.label = d.model;
                d.badge = d.n;
            });

            models_control
                .items(data)
                .update();
        })
    }
});

filter_chain.addFilter({component: years_control, verb: "in", type: "simple", field: "make_year",
    fetchNewData: function (query) {
        data_provider.getYearsData(query, function(err, data) {
            if (err) throw err;

            data.forEach(function(d){
                d.label=d.make_year;
                d.badge=d.n;
                d.id=d.make_year;
            });

            years_control
                .items(data)
                .update();
        });
    }
});

var badge_control = badges_control();
d3.select("#badge_control").call(badge_control);

badge_control.onChange(function(change) {
   if (change.region) regions_control.uncheck(change.region);
   if (change.producer) producers_control.uncheck(change.producer);
});

filter_chain.triggerChange(-1);


filter_chain.onChange(function(query) {
    var region_query = query.filter(function(d){return d.field=="region"})[0];
    if (region_query && region_query.values && region_query.values.length)
        small_multiples_chart.filterRegions(region_query.values);
    else
        small_multiples_chart.filterRegions(null);

    badge_control.query(query).update();

    data_provider.getTimeSeriesByQueryByRegion(query, function(err, data) {
        console.log(arguments);
        if (err) throw err;

        console.log(data.by_region);

        small_multiples_chart
            .items(data.by_region)
            .update();

        total_chart.data(data.total).update();
    });
});

data_provider.getTimeSeriesByQueryByRegion({}, function(err, data ){
        if (err) throw err;

        total_chart
            .data(data.total);
        d3.select('#total_chart').call(total_chart);

        small_multiples_chart
            .items(data.by_region);
        d3.select("#small_multiples").call(small_multiples_chart);
});
