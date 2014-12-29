var App = App || {};

App.module = function ($) {

    var ckEditor = function(el) {
        var $el = $(el);
        CKEDITOR.replace($el);
    };

    var equalheight = function(container) {
        var currentTallest = 0;
        var currentRowStart = 0;
        var rowDivs = [];
        var $el;
        var topPosition = 0;

        $(container).each(function() {
            $el = $(this);
            $($el).height('auto');
            topPostion = $el.position().top;

            if (currentRowStart != topPostion) {
                for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
                    rowDivs[currentDiv].height(currentTallest);
                }
                rowDivs.length = 0; // empty the array
                currentRowStart = topPostion;
                currentTallest = $el.height();
                rowDivs.push($el);
            } else {
                rowDivs.push($el);
                currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
            }
            for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
                rowDivs[currentDiv].height(currentTallest);
            }
        });

    };

    var rezised = function(el) {
        var $el = $(el);

        $(window).resize(function(){
            equalheight($el);
        });
    };

    var pieChart = function() {
        if (typeof(google) != "undefined") {
            google.load("visualization", "1", {packages: ["corechart"]});
            google.setOnLoadCallback(function() {
                $('.has-chart').googleCharts();
            });
        }
    };

    var AppPublic = {
        equalheight: equalheight,
        rezised: rezised,
        ckEditor: ckEditor,
        pieChart: pieChart
    };

    return AppPublic;

}(jQuery);
