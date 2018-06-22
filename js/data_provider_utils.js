function fillDates(sorted, extent) {
    if (sorted.length < 3) return sorted;

    if (!extent) extent = d3.extent(sorted, function(d){return d.d_reg});
    var sequence = datesInRange(extent[0], extent[1]);
    var idx = 0;
    return sequence.map(function(date_str){
        if (!sorted[idx] || date_str !== sorted[idx].d_reg) return {d_reg: date_str, n:0};
        return sorted[idx++];
    });
}

function addDays(date_str, n) {
    var date = moment.utc(date_str);
    date.add(1, 'days');
    return date.toISOString().substr(0, 10);
}

function datesInRange(min_str, max_str) {
    var date_str = min_str;
    var result = [];

    while (date_str <= max_str) {
        result.push(date_str);
        date_str = addDays(date_str, 1);
    }

    return result;
}