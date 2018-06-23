var total_chart = smallchart()
    .varName("n");

var small_multiples_chart = small_multiples();

data_provider.getRegionsData(function(err, regions) {
    if (err) throw err;

    var items = regions.map(function(d){
        return {label: d.name.replace(" область", ""), badge: d.n, id: d.id}
    });

    var regions_control = list_control()
        .id("region")
        .placeholder("Введіть область")
        .show_badges(true)
        .items(items);

    d3.select('#regions_control').call(regions_control);
    filter_observer.addFilter(regions_control, regions_control.id());
});


data_provider.getProducersData(function(err, producers) {
    if (err) throw err;

    var items = producers.map(function(d){
        return {label: d.producer, badge: d.n, id: d.producer}
    });

    var producers_control = list_control()
        .id("producer")
        .placeholder("Введіть марку")
        .show_badges(true)
        .items(items);

    d3.select('#producers_control').call(producers_control);
    filter_observer.addFilter(producers_control, producers_control.id());
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


filter_observer.onChange(function(query) {
    small_multiples_chart.filterRegions(query.region);

    data_provider.getTimeSeriesByQueryByRegion(query, function(err, data) {
        if (err) throw err;

        console.log(data.by_region);

        small_multiples_chart
            .items(data.by_region)
            .update();

        total_chart.data(data.total).update();

    });
});