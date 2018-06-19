data_provider.getDailyData(function(daily_data) {
    console.log(daily_data);
    var total_chart = smallchart()
        .data(daily_data)
        .varName("n");


    d3.select('#total_chart').call(total_chart);
    // .on("change", update_pension_age_changed).on("dragend", ballance_chart.dragend);

});

data_provider.getRegionsData(function(regions) {
    var items = regions.map(function(d){
        return {label: d.name.replace(" область", ""), badge: d.n}
    });

    var regions_control = list_control()
        .placeholder("Введіть область")
        .show_badges(true)
        .items(items);

    d3.select('#regions_control').call(regions_control);
});


data_provider.getProducersData(function(producers) {
    var items = producers.map(function(d){
        return {label: d.producer, badge: d.n}
    });

    var producers_control = list_control()
        .placeholder("Введіть марку")
        .show_badges(true)
        .items(items);

    d3.select('#producers_control').call(producers_control);
});