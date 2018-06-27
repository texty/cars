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

filter_observer.addFilter(regions_control, regions_control.id());
filter_observer.addFilter(producers_control, producers_control.id());
filter_observer.addFilter(models_control, models_control.id());
filter_observer.addFilter(years_control, years_control.id());

var badge_control = badges_control();
d3.select("#badge_control").call(badge_control);

badge_control.onChange(function(change) {
   if (change.region) regions_control.uncheck(change.region);
   if (change.producer) producers_control.uncheck(change.producer);
    
    
});

regions_control.onChange(function(event){
    updateProducers();
    updateMakeYears();
    updateModels();
});

producers_control.onChange(function(event){
    var change_d = event.change;

    if (change_d.checked) {
        var query = filter_observer.getCurrentQuery();
        query.producer = [change_d.id];

        data_provider.getModelsData(query, function(err, data) {
            if (err) throw err;

            data.forEach(function(d){
                d.label = d.model;
                d.badge = d.n;
            });

            models_control
                .state(change_d)
                .items(data)
                .update();

        })
    } else {
        change_d.models = null;

        models_control
            .state(null)
            .items([])
            .update()
    }

    updateMakeYears();
});

models_control.onChange(function(event){
    updateMakeYears();
    var checked = event.all.filter(function(d) {return d.checked});
    if (!checked.length) return models_control.state().models = null;

    models_control.state().models = checked;
});

filter_observer.onChange(function(query) {
    small_multiples_chart.filterRegions(query.region);
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


updateMakeYears();






data_provider.getRegionsData(function(err, regions) {
    if (err) throw err;

    var items = regions.map(function(d){
        return {label: d.name.replace(" область", ""), badge: d.n, id: d.id}
    });

    regions_control
        .items(items)
        .update();
});


data_provider.getProducersData({}, function(err, producers) {
    if (err) throw err;

    var items = producers.map(function(d){
        return {label: d.producer, badge: d.n, id: d.producer}
    });

    producers_control
        .items(items)
        .update();
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




function updateProducers() {
    var query = filter_observer.getCurrentQuery();

    data_provider.getProducersData(query, function(err, data) {
        if (err) throw err;

        data.forEach(function(d){
            d.label = d.producer;
            d.badge = d.n;
        });

        producers_control
            .items(data)
            .update();
    })
}

function updateMakeYears() {
    var query = filter_observer.getCurrentQuery();

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
    })
}

function updateModels() {
    if (!models_control.state()) return;

    var query = filter_observer.getCurrentQuery();
    query.producer = [models_control.state().producer];

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