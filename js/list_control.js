function list_control() {

    var template = Handlebars.compile($("#list-control-template").html());

    var container
        , context = {
            placeholder: "",
            items: [],
            show_badges: false
        }
        , badgeFormat
        , ps
        ;

    function my(selection) {
        selection.each(function(d) {
            container = this;
        });
        
        render();
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

    my.render = render;

    function render() {
        var cont = d3.select(container);
        cont.html(template(context));

        const list_container = cont.select("div.ul-container").node();
        ps = new PerfectScrollbar(list_container, {
            suppressScrollX: true
        });

        return my;
    }


    return my;
}

// Handlebars.registerHelper('ifCond', function(v1, v2, options) {
//     if(v1 === v2) {
//         return options.fn(this);
//     }
//     return options.inverse(this);
// });