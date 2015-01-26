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

    var video = function(el) {
        var $el = $(el);
        $el.on("click", function(){
            $.fancybox({
                href: this.href,
                type: $(this).data("type"),
                padding     : 0,
                margin      : 50,
                maxWidth	: 1280,
                maxHeight	: 720,
                fitToView	: false,
                width		: '90%',
                height		: '90%'
            }); // fancybox
            return false
        }); // on
    };

    var checkButton = function(el) {
        var $el = $(el);

        $($el).on('change', function(){
            var test = $(this).val();
            test == 0 ? $(".block_link").toggle() :  $(".block_link").hide();
            test == 1 ? $(".block_media").toggle() :  $(".block_media").hide();
        });
    };

    var AppPublic = {
        equalheight: equalheight,
        rezised: rezised,
        ckEditor: ckEditor,
        pieChart: pieChart,
        checkButton: checkButton,
        video: video
    };

    return AppPublic;

}(jQuery);
