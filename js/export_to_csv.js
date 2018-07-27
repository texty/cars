var export_to_csv = (function(){
    var module = {}
        ;

    //todo pass data here
    module.downloadData = function() {
        var exportData = [];

        carsOnClick.forEach(function(row) {
            row.values.forEach(function(value) {
                exportData.push({id: row.id, date: value.date, number: value.number})
            });
        });

        var csvContent = "data:text/csv;charset=utf-8," +
            "id,date,number\n" +
            exportData.map(function(obj){
                return [obj.id, obj.date, obj.number].join(",");
            }).join("\n");

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "data.csv");
        link.innerHTML= "Click Here to download";
        document.body.appendChild(link); // Required for FF
        link.style.visibility = 'hidden';
        link.click();
    };


    return module;
})();

