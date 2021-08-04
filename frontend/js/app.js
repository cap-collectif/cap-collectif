/*eslint-disable */
import 'core-js/es/object';
import * as moment from 'moment';
import 'moment-timezone';
import React from 'react';
import ReactDOM from 'react-dom';
import 'url-search-params-polyfill';
import { shouldPolyfill } from '@formatjs/intl-pluralrules/should-polyfill';
import { shouldPolyfill as relativeShouldPolyfill } from '@formatjs/intl-relativetimeformat/should-polyfill';

if (process.env.NODE_ENV === 'development') {
  if (new URLSearchParams(window.location.search).get('axe')) {
    global.axe(React, ReactDOM, 1000);
  }
}

// When chunk is not loaded
window.addEventListener('error', e => {
  if (/Loading chunk [\d]+ failed/.test(e.message)) {
    window.location.reload(true);
  }
});

/* ## MOMENT ## */

// Use window.locale to set the current locale data
const { locale, timeZone } = window;

if (locale) {
  let localeMoment = null;

  switch (locale) {
    case 'en-GB':
    case 'eu-EU':
      localeMoment = 'en-gb';
      break;
    case 'de-DE':
      localeMoment = 'de';
      break;
    case 'es-ES':
      localeMoment = 'es';
      break;
    case 'nl-NL':
      localeMoment = 'nl';
      break;
    case 'sv-SE':
      localeMoment = 'sv';
      break;
    case 'fr-FR':
    case 'oc-OC':
    default:
      localeMoment = 'fr';
      break;
  }

  // Quick way to detect IE11 as it also needs Intl polyfills
  if (!Intl.PluralRules) {
    require('moment/locale/fr');
    require('moment/locale/nl');
    require('moment/locale/en-gb');
    require('moment/locale/es');
    require('moment/locale/de');
    moment.locale(localeMoment);
    moment.tz.setDefault(timeZone);
  } else {
    import(`moment/locale/${localeMoment}`).then(() => {
      moment.locale(localeMoment);
      moment.tz.setDefault(timeZone);
    });
  }
}

window.__SERVER__ = false;

// Sometimes an iframe import babel-polyfill (eg: typeform)
// This trick avoid multiple babel-polyfill loaded
if (!global._babelPolyfill) {
  require('babel-polyfill');
}

const config = require('./config').default;
global.Cookies = require('js-cookie');

require('fancybox')($);

require('./modernizr');
require('es6-promise');
if (!global.fetch) {
  require('fetch');
}

if (!Modernizr.intl) {
  require('./browserUpdate');
}

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

if (isSafari) {
  // polyfill for IntersectionObserver
  require('intersection-observer');
}

global.cookieMonster = require('./CookieMonster').default;

async function polyfill(locale: string) {
  if (!shouldPolyfill(locale)) {
    return;
  }
  // Load the polyfill 1st BEFORE loading data
  await import('@formatjs/intl-pluralrules/polyfill');

  switch (locale) {
    case 'en-GB':
    case 'eu-EU':
      await import('@formatjs/intl-pluralrules/locale-data/en');
      break;
    case 'de-DE':
      await import('@formatjs/intl-pluralrules/locale-data/de');
      break;
    case 'es-ES':
      await import('@formatjs/intl-pluralrules/locale-data/es');
      break;
    case 'nl-NL':
      await import('@formatjs/intl-pluralrules/locale-data/nl');
      break;
    case 'sv-SE':
      await import('@formatjs/intl-pluralrules/locale-data/sv');
      break;
    case 'fr-FR':
    case 'oc-OC':
    default:
      await import('@formatjs/intl-pluralrules/locale-data/fr');
      break;
  }
}

// react-intl@3.x polyfills for iNtErNeT eXpLoReR 11
if (!Intl.PluralRules) {
  polyfill(locale)
    .then((accepted, rejected) => {
      console.log('intl-pluralrules imported');
    })
    .catch(error => console.error('intl-pluralrules', error));
}

async function relativePolyfill(locale: string) {
  if (!relativeShouldPolyfill(locale)) {
    return;
  }
  // Load the polyfill 1st BEFORE loading data
  await import('@formatjs/intl-relativetimeformat/polyfill');

  switch (locale) {
    case 'en-GB':
    case 'eu-EU':
      await import('@formatjs/intl-relativetimeformat/locale-data/en');
      break;
    case 'de-DE':
      await import('@formatjs/intl-relativetimeformat/locale-data/de');
      break;
    case 'es-ES':
      await import('@formatjs/intl-relativetimeformat/locale-data/es');
      break;
    case 'nl-NL':
      await import('@formatjs/intl-relativetimeformat/locale-data/nl');
      break;
    case 'sv-SE':
      await import('@formatjs/intl-relativetimeformat/locale-data/sv');
      break;
    case 'fr-FR':
    case 'oc-OC':
    default:
      await import('@formatjs/intl-relativetimeformat/locale-data/fr');
      break;
  }
}
if (!Intl.RelativeTimeFormat) {
  relativePolyfill(locale)
    .then((accepted, rejected) => {
      console.log('intl-relativetimeformat imported');
    })
    .catch(error => console.error('intl-relativetimeformat', error));
}

// Our global App for symfony
global.App = ($ => {
  const equalheight = container => {
    let currentTallest = 0;
    let currentRowStart = 0;
    const rowDivs = [];
    let topPosition = 0;

    $(container).each((index, el) => {
      const $el = $(el);
      $el.height('auto');
      topPosition = $el.position().top;

      if ($(window).width() > 767) {
        let currentDiv = 0;

        if (currentRowStart !== topPosition) {
          for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
            rowDivs[currentDiv].height(currentTallest);
          }
          rowDivs.length = 0; // empty the array
          currentRowStart = topPosition;
          currentTallest = $el.height();
          rowDivs.push($el);
        } else {
          rowDivs.push($el);
          currentTallest = currentTallest < $el.height() ? $el.height() : currentTallest;
        }
        for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
          rowDivs[currentDiv].height(currentTallest);
        }
      }
    });
  };

  const resized = el => {
    const $el = $(el);

    $(window).resize(() => {
      equalheight($el);
    });
  };

  const customModal = el => {
    const $el = $(el);

    $el.appendTo('body');
  };

  const video = el => {
    const $el = $(el);
    $el.on('click', e => {
      $.fancybox({
        href: e.currentTarget.href,
        type: $(e.currentTarget).data('type'),
        padding: 0,
        margin: 50,
        maxWidth: 1280,
        maxHeight: 720,
        fitToView: false,
        width: '90%',
        height: '90%',
      });
      return false;
    }); // on
  };

  const checkButton = el => {
    const $el = $(el);

    $($el).on('change', e => {
      const test = $(e.currentTarget).val();
      if (test === 0) {
        $('.block_media').hide();
        $('.block_link').toggle();
      } else if (test === 1) {
        $('.block_media').toggle();
        $('.block_link').hide();
      }
    });
  };

  const externalLinks = () => {
    $(document).on('click', '.external-link', e => {
      window.open($(e.currentTarget).attr('href'));
      return false;
    });
  };

  const showMap = containerId => {
    const mapElement = document.getElementById(containerId);
    const lat = mapElement.getAttribute('data-lat');
    const lng = mapElement.getAttribute('data-lng');

    mapboxgl.accessToken = config.mapProviders.MAPBOX.apiKey;

    // Map
    const mapOptions = {
      center: [lng, lat],
      zoom: 15,
      container: containerId,
      style: 'mapbox://styles/mapbox/streets-v10',
    };
    const map = new mapboxgl.Map(mapOptions);
    map.addControl(new mapboxgl.NavigationControl());

    // Marker
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = 'url(/svg/marker.svg)';
    el.style.backgroundSize = 'cover';
    el.style.width = '40px';
    el.style.height = '40px';

    new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map);
  };

  const makeSidebar = options => {
    // Fix containers
    const containers = `${options.container} .container`;
    $(options.container).addClass('container  sidebar__container');
    $(containers)
      .removeClass('container  container--thinner')
      .addClass('container--with-sidebar');

    // Handle small screens
    $(options.toggle).on('click', () => {
      $(options.hideable).toggleClass('sidebar-hidden-small');
      $(options.overlay).toggleClass('sidebar__darkened-overlay');
    });
  };

  const carousel = () => {
    $('.carousel-sidenav li').on('click', e => {
      e.preventDefault();
      $('.carousel-sidenav li').each((index, el) => {
        $(el).removeClass('active');
      });
      $(e.currentTarget).addClass('active');
    });
  };

  const skipLinks = () => {
    $('.js-skip-links a').on('focus', () => {
      $('.js-skip-links').addClass('active');
      $('body').css('margin-top', $('.js-skip-links').height());
    });
    $('.js-skip-links a').on('blur', () => {
      $('.js-skip-links').removeClass('active');
      $('body').css('margin-top', '0');
    });
  };

  const appendChildToDOM = content => {
    let element;
    let cleanContent;
    if (content.match(/<\s*script\s*>.*<\/\s*script\s*>/)) {
      element = document.createElement('script');
      cleanContent = content.replace(/<\s*script\s*>/, '').replace(/<\/\s*script\s*>/, '');
    } else if (content.match(/<\s*noscript\s*>.*<\/\s*noscript\s*>/)) {
      element = document.createElement('div');
      cleanContent = content.replace(/<\s*noscript\s*>/, '').replace(/<\/\s*noscript\s*>/, '');
    } else {
      console.error('Currently not supporting tag different from script and no script.');
      return;
    }
    element.innerHTML = cleanContent;
    document.body.appendChild(element);
    return element;
  };

  const dangerouslyExecuteHtml = scriptText => {
    let newChildren = [];
    if (scriptText && scriptText.length > 0) {
      // TODO find a better way to allow user to use double quotes than replacing or encoding
      scriptText = scriptText.replace(/"/g, "'");
      // test if script is pure js or contains html
      if (scriptText[0] === '<') {
        /**
         *    In this case, the script given contains html tags.
         *
         *    For instance: "<script>console.log('toto');</script><noscript><img src='blabla'/></noscript>"
         */

        // separate script and noscript tags
        const matches = scriptText.split(
          /(?=<\s*noscript\s*>.*<\/\s*noscript\s*>|<\s*script\s*>[^<]*<\/\s*script\s*>)/,
        );
        matches.map(match => {
          newChildren.push(appendChildToDOM(match));
        });
      } else {
        /**
         *    In this case, the script given contains raw javascript.
         *
         *    For instance: "console.log('toto');gtag('register', function);console.log('tata');"
         */
        const script = document.createElement('script');
        script.innerHTML = scriptText;
        document.body.appendChild(script);
        newChildren.push(script);
      }
      return newChildren;
    }
  };

  return {
    dangerouslyExecuteHtml,
    equalheight,
    resized,
    checkButton,
    video,
    externalLinks,
    showMap,
    makeSidebar,
    carousel,
    customModal,
    skipLinks,
  };
})(jQuery);
