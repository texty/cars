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

var field_names_dictionary = {
    region: "Область",
    kind: "Тип",
    fuel: "Паливо",
    brand: "Модель",
    make_year: "Рік випуску",
    color: "Колір",
    capacity: "Об'єм (см³)",
    total_weight: "Повна маса (кг)"
};



var total_chart = smallchart()
    .varName("n")
    .xTicks(10);

var small_multiples_chart = small_multiples();

var controls = {};

controls.region = addListControl(filter_chain, "region", "Введіть область", data_provider.getRegionsData);
controls.kind = addListControl(filter_chain, "kind", "Введіть тип", data_provider.getFieldData);
controls.fuel = addListControl(filter_chain, "fuel", "Оберіть тип палива", data_provider.getFieldData);
controls.brand = addListControl(filter_chain, "brand", "Оберіть марку/модель", data_provider.getFieldData).max_selected(5);

// addListControl(filter_chain, "producer", "Введіть марку", data_provider.getFieldData);
// addListControl(filter_chain, "model", "Введіть модель", data_provider.getFieldData);

controls.make_year = addListControl(filter_chain, "make_year", "Введіть рік випуску", data_provider.getFieldData);
controls.capacity = addRangeControl(filter_chain, "capacity", "Оберіть об'єм двигуна", "см³",  data_provider.getExtentData);
controls.total_weight = addRangeControl(filter_chain, "total_weight", "Повна маса", "кг", data_provider.getExtentData);
controls.color = addListControl(filter_chain, "color", "Оберіть колір", data_provider.getFieldData);

var badge_control = badges_control()
    .color_fields(["brand"])
    .display_value_dictionary({region: region_utils.REGION_SHORT_BY_CODE})
    .field_name_dictionary(field_names_dictionary);
d3.select("#badge_control").call(badge_control);

badge_control.onChange(function(change) {
    controls[change.field].uncheck(change.value);
    //todo for range controls
});

filter_chain.triggerChange(-1);


filter_chain.onChange(function(query) {
    var region_query = query.filter(function(d){return d.field=="region"})[0];
    if (region_query && region_query.values && region_query.values.length)
        small_multiples_chart.filterRegions(region_query.values);
    else
        small_multiples_chart.filterRegions(null);

    badge_control.query(query).update();

    var brand_filter = query.filter(function(d) {return d.field === "brand"})[0];

    if (brand_filter) {
        data_provider.getTimeSeriesByQueryByRegionByBrand(query, function(err, data) {
            if (err) throw err;

            console.log(data.by_region);

            var brands = brand_filter.values;
            total_chart_legend.data(brands).update();

            small_multiples_chart
                .items(data.by_region)
                .update();

            total_chart.data(data.total).update();
        });

    } else {
        data_provider.getTimeSeriesByQueryByRegion(query, function(err, data) {
            console.log(arguments);
            if (err) throw err;

            console.log(data.by_region);

            total_chart_legend.data([]).update();

            small_multiples_chart
                .items(data.by_region)
                .update();

            total_chart.data(data.total).update();
        });
    }
});

data_provider.getTimeSeriesByQueryByRegion([], function(err, data ){
    if (err) throw err;

    total_chart
        .data(data.total);
    d3.select('#total_chart').call(total_chart);

    small_multiples_chart
        .items(data.by_region);
    d3.select("#small_multiples").call(small_multiples_chart);

    total_chart.update();
    small_multiples_chart.update();
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
    });

    return control;
}

function addRangeControl(filter_chain, field, placeholder, prefix, getFieldData) {
    var element = d3.select("#filter_chain")
        .append("div")
        .attr("class", "col-12 col-sm-6 col-md-4 col-lg-3")
        .append("div")
        .attr("id", field)
        .attr("class", "chain_control");

    var control = range_control()
        .id(field)
        .placeholder(placeholder)
        .prefix(prefix + " ")
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