data_provider.getDailyData(function(err, daily_data) {
    if (err) throw err;

    console.log(daily_data);
    var total_chart = smallchart()
        .data(daily_data)
        .varName("n");


    d3.select('#total_chart').call(total_chart);
    // .on("change", update_pension_age_changed).on("dragend", ballance_chart.dragend);

});

data_provider.getRegionsData(function(err, regions) {
    if (err) throw err;

    var items = regions.map(function(d){
        return {label: d.name.replace(" область", ""), badge: d.n}
    });

    var regions_control = list_control()
        .placeholder("Введіть область")
        .show_badges(true)
        .items(items);

    d3.select('#regions_control').call(regions_control);
});


data_provider.getProducersData(function(err, producers) {
    if (err) throw err;

    var items = producers.map(function(d){
        return {label: d.producer, badge: d.n}
    });

    var producers_control = list_control()
        .placeholder("Введіть марку")
        .show_badges(true)
        .items(items);

    d3.select('#producers_control').call(producers_control);
});

d3.queue()
    .defer(data_provider.getRegionsData)
    .defer(data_provider.getDailyData)
    .await(function(err, regions, daily_data){
        if (err) throw err;

        var items = regions.map(function(d){
            return {label: d.name.replace(" область", ""), badge: d.n}
        });
        
        
    
        var charts_data = items;
        
        var small_multiples_chart = small_multiples()
            .create_item(function(selection) {
                var chart = smallchart()
                    .data(daily_data)
                    .varName("n");

                selection.append("h3").text("область шмобласть")

                selection.append("svg")
                    .attr("class", "smallchart")
                    .attr("width", "100%")
                    .attr("data-aspect-ratio", "0.05")
                    .attr("data-min-height", "72")
                    .call(chart);
            })
            .update_item(function() {console.log("update item")})
            .data(charts_data)
        
        d3.select('#small_multiples').call(small_multiples_chart);
        small_multiples_chart.update();
});
