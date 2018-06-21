
data_provider.getTimeSeriesTotal(function(err, daily_data) {
    if (err) throw err;

    console.log(daily_data);
    window.total_chart = smallchart()
        .data(daily_data)
        .varName("n");


    d3.select('#total_chart').call(total_chart);
    // .on("change", update_pension_age_changed).on("dragend", ballance_chart.dragend);

});

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

data_provider.getTimeSeriesByQueryByRegion({}, function(err, nested ){
        if (err) throw err;

        console.log("nested");
        console.log(nested);

        window.small_multiples_control = small_multiples()
            .items(nested);

        d3.select("#small_multiples").call(small_multiples_control);
});



filter_observer.onChange(function(query) {
    data_provider.getTimeSeriesByQuery(query, function(err, data) {
        if (err) throw err;

        total_chart.data(data).update();
    });

    data_provider.getTimeSeriesByQueryByRegion(query, function(err, data) {
        if (err) throw err;
    
        small_multiples_control
            .items(data)
            .update();
    });
});