data_provider.getDailyData(function(daily_data) {
    console.log(daily_data);
    var total_chart = smallchart()
        .data(daily_data)
        .varName("n")

        // .future(future)
        // .varName('pension_age')
        // .minY(55)
        // .maxY(65)
        // .maxStep(0.5*5)
        // .yTickValues([55, 60, 65])
        // .snapFunction(Math.round)
        // .showTips(true)
        // .drawMode(true)
        // .pension_year(pension_year);

    d3.select('#total_chart').call(total_chart);
    // .on("change", update_pension_age_changed).on("dragend", ballance_chart.dragend);

});