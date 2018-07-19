d3.timeFormatDefaultLocale({
    "decimal": ".",
    "thousands": " ",
    "grouping": [3],
    "currency": ["грн", ""],
    "dateTime": "%a %b %e %X %Y",
    "date": "%d.%m.%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
    "shortDays": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    "months": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    "shortMonths": ["січ", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов", "лис", "гру"]
});





var total_chart = smallchart()
    .varName("n")
    .xTicks(10);

var small_multiples_chart = small_multiples();

var region_control = addListControl(filter_chain, "region", "Введіть область", data_provider.getRegionsData);

addListControl(filter_chain, "kind", "Введіть тип", data_provider.getFieldData);
addListControl(filter_chain, "fuel", "Оберіть тип палива", data_provider.getFieldData);

var brand_control = addListControl(filter_chain, "brand", "Оберіть марку/модель", data_provider.getFieldData);

// addListControl(filter_chain, "producer", "Введіть марку", data_provider.getFieldData);
// addListControl(filter_chain, "model", "Введіть модель", data_provider.getFieldData);

addListControl(filter_chain, "make_year", "Введіть рік випуску", data_provider.getFieldData);
addRangeControl(filter_chain, "capacity", "Оберіть об'єм двигуна", data_provider.getExtentData);
addRangeControl(filter_chain, "total_weight", "Повна маса", data_provider.getExtentData);

var badge_control = badges_control();
d3.select("#badge_control").call(badge_control);

badge_control.onChange(function(change) {
    if (change.region) region_control.uncheck(change.region);
    if (change.brand) brand_control.uncheck(change.brand);
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

data_provider.getTimeSeriesByQueryByRegion([], function(err, data ){
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

    return control;
}

function addRangeControl(filter_chain, field, placeholder, getFieldData) {
    var element = d3.select("#filter_chain")
        .append("div")
        .attr("class", "col-12 col-sm-6 col-md-4 col-lg-3")
        .append("div")
        .attr("id", field)
        .attr("class", "chain_control");

    var control = range_control()
        .id(field)
        .placeholder(placeholder)
        .prefix("кг ")
        .step(50);

    element.call(control);

    filter_chain.addFilter({component: control, verb: "between", type: "simple", field: field,
        fetchNewData: function (query) {
            getFieldData(field, query, function(err, data) {
                if (err) throw err;

                control
                    .domain([data.min, data.max])
                    .empty_count(data.empty)
                    .total_count(data.total)
                    .update();
            });
        }
    });

    return control;
}