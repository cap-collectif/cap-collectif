var App = App || {};

App.module = function ($) {

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

    var resized = function(el) {
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

    var externalLinks = function() {
        $('.external-link').on('click', function(e){
            window.open($(this).attr('href'));
            return false;
        });
    };

    var showMap = function(container) {
        var $mapCanvas = $(container);
        $mapCanvas.each(function() {
            // Map
            var mapOptions = {
                center: new google.maps.LatLng($(this).attr('data-lat'), $(this).attr('data-lng')),
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }
            var map = new google.maps.Map(this, mapOptions);

            // Marker
            var iconBase = 'https://maps.google.com/mapfiles/kml/pushpin/';
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng($(this).attr('data-lat'), $(this).attr('data-lng')),
                map: map,
                icon: iconBase + 'blue-pushpin.png'
            });
        });
    };

    var autocollapse = function(navbars) {
        var $navbars = $(navbars);
        $navbars.each(function() {
            $(this).removeClass('collapsed');
            $('body').removeClass('higher-navbar');
            if ($(this).innerHeight() > 50) {
                $(this).addClass('collapsed');
                $('body').addClass('higher-navbar');
            }
        });
    };

    var initPopovers = function(triggers, options) {
        var $triggers = $(triggers);
        $triggers.attr('tabindex', '0');
        $triggers.popover(options).on('click', function(e){
            e.preventDefault();
            e.stopPropagation();
        });
    };

    var AppPublic = {
        equalheight: equalheight,
        resized: resized,
        pieChart: pieChart,
        checkButton: checkButton,
        video: video,
        externalLinks: externalLinks,
        showMap: showMap,
        autocollapse: autocollapse,
        initPopovers: initPopovers,
    };

    return AppPublic;

}(jQuery);
