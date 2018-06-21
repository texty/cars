
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

d3.queue()
    .defer(data_provider.getRegionsData)
    .defer(data_provider.getTimeSeriesTotal)
    .await(function(err, regions, daily_data){
        if (err) throw err;

        var items = regions.map(function(d){
            var short_name = d.name.replace(" область", "");
            return {label: short_name, badge: d.n, id: short_name}
        });

        //todo
        // фейкові дані. будуть замінені нормальними

        items.forEach(function(obj) {
            obj.timeseries = daily_data;
        });

        var data = items;
        ////




        var containers = d3.select("#small_multiples")
            .selectAll("div.small_multiples_item")
            .data(data, function(d){return d.id})
            .enter()
            .append("div")
            .attr("class", "small_multiples_item");

        containers
            .append("h3")
            .text(function(d){return d.label});

        var svgs = containers
            .append("svg")
            .attr("class", "smallchart")
            .attr("width", "100%")
            .attr("data-aspect-ratio", "0.05")
            .attr("data-min-height", "50")
            .each(function(d, i) {
                var chart = smallchart()
                    .data(daily_data)
                    .varName("n");

                d3.select(this).call(chart);
            });
});



filter_observer.onChange(function(query) {
    data_provider.getTimeSeriesByQuery(query, function(err, data) {
        if (err) throw err;

        total_chart.data(data).update();
        console.log(data)
    });
});