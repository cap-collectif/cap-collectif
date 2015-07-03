import IntlData from './translations/FR'
import CommentSection from './components/Comment/CommentSection';
import AuthService from './services/AuthService';


AuthService
.login()
.then(() => {
    // We enable React apps
    if ($('#render-idea-comments').length) {
        React.render(
            <CommentSection uri="ideas" object={$('#render-idea-comments').data("idea")} {...IntlData} />,
            document.getElementById('render-idea-comments')
        );
    }

    if ($('#render-post-comments').length) {
        React.render(
            <CommentSection uri="posts" object={$('#render-post-comments').data("post")} {...IntlData} />,
            document.getElementById('render-post-comments')
        );
    }

    if ($('#render-event-comments').length) {
        React.render(
            <CommentSection uri="events" object={$('#render-event-comments').data("event")} {...IntlData} />,
            document.getElementById('render-event-comments')
        );
    }
});

// Our global App for symfony
var App = function ($) {

    var equalheight = function(container) {
        var currentTallest = 0;
        var currentRowStart = 0;
        var rowDivs = [];
        var $el;
        var topPosition = 0;

        $(container).each(function() {
            $el = $(this);
            $($el).height('auto');
            topPosition = $el.position().top;

            if ($(window).width() > 767) {
                var currentDiv = 0;

                if (currentRowStart != topPosition) {
                    for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
                        rowDivs[currentDiv].height(currentTallest);
                    }
                    rowDivs.length = 0; // empty the array
                    currentRowStart = topPosition;
                    currentTallest = $el.height();
                    rowDivs.push($el);
                } else {
                    rowDivs.push($el);
                    currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
                }
                for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
                    rowDivs[currentDiv].height(currentTallest);
                }
            }
        });

    };

    var resized = function(el) {
        var $el = $(el);

        $(window).resize(function(){
            equalheight($el);
        });
    };

    var customModal = function(el) {
        var $el = $(el);

        $el.appendTo("body");
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
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng($(this).attr('data-lat'), $(this).attr('data-lng')),
                map: map
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

    var makeSidebar = function(options) {

        // Fix containers
        var containers = options['container'] + ' .container';
        $(options['container']).addClass('container  sidebar__container');
        $(containers).removeClass('container  container--thinner').addClass('container--with-sidebar');

        // Handle small screens
        $(options['toggle']).on('click', function() {
            $(options['hideable']).toggleClass('sidebar-hidden-small');
            $(options['overlay']).toggleClass('sidebar__darkened-overlay');
        })
    };

    var carousel = function() {
        $('.carousel-sidenav li').on('click', function(e) {
            e.preventDefault();
            $('.carousel-sidenav li').each(function(){
                $(this).removeClass('active');
            })
            $(this).addClass('active');
        });
    };

    var hideableMessageAndCheckbox = function(options) {
        var messageDiv = options['message'];
        var messageField = messageDiv + ' textarea';
        var checkboxDiv = options['checkbox'];
        var checkboxField = checkboxDiv + ' input[type="checkbox"]';
        var oldVal = null;

        $(messageField).on('change keyup paste', function(){
            var currentVal = $(this).val();
            if(currentVal == oldVal) {
                return;
            }
            oldVal = currentVal;
            if(currentVal) {
               $(checkboxDiv).addClass('hidden');
                return;
            }
            $(checkboxDiv).removeClass('hidden');
        });

        $(checkboxField).on('change', function(){
            if($(this).prop('checked')) {
                $(messageDiv).addClass('hidden');
                return;
            }
            $(messageDiv).removeClass('hidden');
        });
    };

    return {
        equalheight: equalheight,
        resized: resized,
        pieChart: pieChart,
        checkButton: checkButton,
        video: video,
        externalLinks: externalLinks,
        showMap: showMap,
        autocollapse: autocollapse,
        initPopovers: initPopovers,
        makeSidebar: makeSidebar,
        carousel: carousel,
        hideableMessageAndCheckbox: hideableMessageAndCheckbox,
        customModal: customModal
    };

}(jQuery);

export default App;
