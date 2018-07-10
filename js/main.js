var total_chart = smallchart()
    .varName("n");

var small_multiples_chart = small_multiples();

addListControl(filter_chain, "region", "Введіть область", data_provider.getRegionsData);
addListControl(filter_chain, "fuel", "Оберіть тип палива", data_provider.getFieldData);
addListControl(filter_chain, "producer", "Введіть марку", data_provider.getFieldData);
addListControl(filter_chain, "model", "Введіть модель", data_provider.getFieldData);
addListControl(filter_chain, "make_year", "Введіть рік випуску", data_provider.getFieldData);
addListControl(filter_chain, "capacity", "Введіть об'єм двигуна", data_provider.getFieldData);

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


function addListControl(filter_chain, field, placeholder, getFieldData) {
    var element = d3.select("#filter_chain")
        .append("div")
        .attr("class", "col-12 col-sm-6 col-md-4 col-lg-3")
        .append("div")
        .attr("id", field)
        .attr("class", "chain_control");

    var control = list_control()
        .id(field)
        .placeholder(placeholder)
        .show_badges(true);
    
    element.call(control);
    
    filter_chain.addFilter({component: control, verb: "in", type: "simple", field: field,
        fetchNewData: function (query) {
            getFieldData(field, query, function(err, data) {
                if (err) throw err;

                control
                    .items(data)
                    .update();
            });
        }
    })
}