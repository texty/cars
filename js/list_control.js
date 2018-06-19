function list_control() {

    // var template = Handlebars.compile($("#list-control-template").html());

    var container
        , context = {
            placeholder: "",
            items: [],
            show_badges: false
        }
        , badgeFormat
        , ps
        , filter_term = ""
        , item
        // , ul_container
        ;

    function my(selection) {
        selection.each(function(d) {
            var container = d3.select(this)
                .append("div")
                .attr("class", "list-control");


            var searchbox = container
                .append("input")
                .attr("type", "text")
                .attr("name", "search")
                .attr("class", "searchbox")
                .attr("placeholder", context.placeholder);

            var ul_container = container
                .append("div")
                .attr("class", "ul-container always-visible");

            var ul = ul_container
                .append("ul")
                .attr("class", "list-group form-check");

            var ps = new PerfectScrollbar(ul_container.node(), {
                suppressScrollX: true,
                minScrollbarLength: 20
            });

            searchbox.on("change input", function(){
                var term = normalize(this.value);
                item.classed("hidden", function(d) {return normalize(d.label).indexOf(term) < 0});
                
                //todo
                // Це фільтрування повинно бути тільки візуальним. 
                // Тобто фільтр просто допомагає знайти потрібний елемент, але не впливає на стейт
                
            });

            my.update = update;
            update();

            function update() {
                var item_selection = ul
                    .selectAll("li.list-group-item")
                    .data(context.items);

                item_selection.exit().remove();

                item = item_selection.enter() //
                    .append("li")
                    .attr("class", "list-group-item d-flex justify-content-between align-items-center");

                var label = item
                    .append("label")
                    .attr("class", "form-check-label d-flex justify-content-between align-items-center");

                var checkbox = label
                    .append("input")
                    .attr("type", "checkbox")
                    .attr("class", "form-check-input")
                    .attr("value", "");

                var check_text = label
                    .append("span")
                    .attr("class", "check-text")
                    .text(function(d){return d.label});

                if (context.show_badges) {
                    var badge = label
                        .append("span")
                        .attr("class", "badge badge-primary badge-pill")
                        .text(function(d){return d.badge});
                }

                ps.update();

                return my;
            }
        });

    }

    my.items = function(value) {
        if (!arguments.length) return context.items;
        context.items = value;
        return my;
    };

    my.placeholder = function(value) {
        if (!arguments.length) return context.placeholder;
        context.placeholder = value;
        return my;
    };

    my.show_badges = function(value) {
        if (!arguments.length) return context.show_badges;
        context.show_badges = value;
        return my;
    };


    function normalize(str) {
        if (!str) return "";
        return str.trim().toUpperCase().replace(/\s+/g, " ");
    }


    return my;
}
