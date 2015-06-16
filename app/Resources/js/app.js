var App = App || {};

var CommentBody = React.createClass({

    render() {
        <p className="opinion__text">
            { this.renderTrashedLabel() }
            { this.props.comment.body }
        </p>
    },

    renderTrashedLabel() {
        if (this.props.comment.isTrashed) {
            return(
                <span className="label label-default" style="position: static">
                    comment.trashed.label
                </span>
            );
        }
    }

});

var CommentAuthor = React.createClass({

    render() {
        <p className="h5  opinion__user">
            { this.renderAuthorName() }
        </p>
    },

    renderAuthorName() {
        if (this.props.comment.author) {
            return <a href="#">{ this.props.comment.author.username }</a>
        }
        return this.props.comment.authorName;
    }

});


var Comment = React.createClass({

    render() {
        var comment = this.props.comment;
        return (
          <li className="opinion  opinion--comment" >
            <div className="opinion__body">
                /** avatar **/
                <div className="opinion__data">

                    <CommentAuthor comment={comment} />
                    <p className="excerpt  opinion__date">
                        { comment.created_at }
                    </p>
                    <CommentBody comment={comment} />
                </div>
            </div>
          </li>
        );
    }
});

        // {% include 'CapcoUserBundle:Avatar:avatar.html.twig' with { 'user': author, 'link_classes': 'pull-left'} only %}
        // <div class="opinion__data">
        //     <p class="h5  opinion__user">
        //         {% if null != author %}
        //             <a href="{{ path('capco_user_profile_show_all', {'slug': author.slug}) }}">{{ author.username }}</a>
        //         {% else %}
        //             {{ comment.authorName }}
        //         {% endif %}
        //     </p>
        //     <p class="excerpt  opinion__date">{{ comment.createdAt | localizeddate('long', 'short', app.request.locale) }}</p>
        // </div>
        // {% if profile is defined %}
        //     <p>{{ 'comment.linked_object' | trans({}, 'CapcoAppBundle') }} <a href="{{ capco_comment_object_url(comment) }}">{{ capco_comment_object(comment) }}</a></p>
        // {% endif %}

var CommentList = React.createClass({

    getInitialState() {
        return {
            comments: []
        };
    },

    componentDidMount(){
        fetch('http://local.capcollectif.com/api/ideas/' + this.props.idea + '/comments', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then((response) => { return response.json(); })
        .then((data) => {
            this.setState({
                'comments': data
            });
        });

    },

    render() {
        return (
          <div>
                <h1>Hello</h1>
                <div>
                {
                    this.state.comments.map((comment) => {
                        return <Comment key={comment.id} comment={comment} />;
                    })
                }
                </div>
          </div>
        );
    }
});

if ($('#render-idea-comments').length) {
    React.render(
        <CommentList idea={$('#render-idea-comments').data("idea")} />,
        document.getElementById('render-idea-comments')
    );
}


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
            topPosition = $el.position().top;

            if ($(window).width() > 767) {

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
        makeSidebar: makeSidebar,
        carousel: carousel,
        hideableMessageAndCheckbox: hideableMessageAndCheckbox,
        customModal: customModal,
    };

    return AppPublic;

}(jQuery);
