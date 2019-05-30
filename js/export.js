
function export_button_click(){

    var query = filter_chain.getCurrentQuery();
    var brand_filter = query.filter(function(f){return f.field === "brand"})[0];

    var csvContent = "data:text/csv;charset=utf-8,";

    if (brand_filter) {
        data_provider.getDataForExportWithBrand(query, function(err, export_data) {
            csvContent += "month,region,brand,vehicles_registered\n" +
                export_data.map(function(obj){
                    return [obj.month, obj.region, obj.brand, obj.vehicles_registered].join(",");
                }).join("\n");
        });
        downloadString(csvContent, "data.csv");
    } else {
        data_provider.getDataForExport(query, function(err, export_data) {
            csvContent += "month,region,vehicles_registered\n" +
                export_data.map(function(obj){
                    return [obj.month, obj.region, obj.vehicles_registered].join(",");
                }).join("\n");
        });
        downloadString(csvContent, "data.csv");
    }
}

function export_button_xlsx_click(){

    var query = filter_chain.getCurrentQuery();
    var brand_filter = query.filter(function(f){return f.field === "brand"})[0];

    var wb = XLSX.utils.book_new();
    wb.SheetNames.push("Sheet1");


    if (brand_filter) {
        // ["month", "region", "brand", "vehicles_registered"]

        data_provider.getDataForExportWithBrand(query, function(err, export_data) {
            var json_data = export_data.map(function(obj){
                return {
                    month: obj.month,
                    region: obj.region,
                    brand: obj.brand,
                    vehicles_registered: obj.vehicles_registered
                }
            });

            wb.Sheets["Sheet1"] = XLSX.utils.json_to_sheet(json_data);
            var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
            saveAs(new Blob([s2ab(wbout)], {type:"application/octet-stream"}), 'export.xlsx');
        });


    } else {
        data_provider.getDataForExport(query, function(err, export_data) {
            var json_data = export_data.map(function(obj){
                return {
                    month: obj.month,
                    region: obj.region,
                    vehicles_registered: obj.vehicles_registered
                }
            });

            wb.Sheets["Sheet1"] = XLSX.utils.json_to_sheet(json_data);
            var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
            saveAs(new Blob([s2ab(wbout)], {type:"application/octet-stream"}), 'export.xlsx');
        });
    }
}

function downloadString(csvContent, filename) {
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    link.innerHTML= "Click Here to download";
    document.body.appendChild(link); // Required for FF
    link.style.visibility = 'hidden';
    link.click();
}

function s2ab(s) {
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf);  //create uint8array as viewer
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;
}
