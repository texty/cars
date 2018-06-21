function fillDates(sorted) {
    if (sorted.length < 3) return sorted;

    var extent = d3.extent(sorted, function(d){return d.d_reg});
    var sequence = datesInRange(extent[0], extent[1]);
    var idx = 0;
    return sequence.map(function(date_str){
        if (date_str === sorted[idx].d_reg) return sorted[idx++];
        return {d_reg: date_str, n:0}
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