/* eslint-disable */
// @flow

const GA_COOKIE_NAMES = ['__utma', '__utmb', '__utmc', '__utmz', '_ga', '_gat', '_gid'];

const GTAG_COOKIE_NAMES = ['_gcl_au'];

const PK_COOKIE_NAMES = ['_pk_ref', '_pk_cvar', '_pk_id', '_pk_ses', '_pk_hsr'];

const ATI_COOKIE_NAMES = [
  'atidvisitor',
  'atreman',
  'atredir',
  'atsession',
  'atuserid',
  'attvtreman',
  'attvtsession',
  'atwebosession',
];

const SCROLL_VALUE_TO_CONSENT = 2000;

class CookieMonster {
  cookieBanner: any;
  cookieConsent: any;

  constructor() {
    if (!!(typeof window !== 'undefined' && window.document && window.document.createElement)) {
      const document = window.document;
    } else {
      return;
    }
    this.cookieBanner = document.getElementById('cookie-banner');
    this.cookieConsent = document.getElementById('cookie-consent');
    // $FlowFixMe
    window._capco_ga_cookie_value = Cookies.getJSON('_ga');
  }

  isDoNotTrackActive = () => {
    const doNotTrack = navigator.doNotTrack;
    return doNotTrack === 'yes' || doNotTrack === '1';
  };

  processCookieConsent = () => {
    const consentCookie = Cookies.getJSON('hasFullConsent');
    const analyticConsent = Cookies.getJSON('analyticConsentValue');
    const adsConsent = Cookies.getJSON('adCookieConsentValue');

    if (this.cookieBanner === null && document.getElementById('cookie-banner') !== null) {
      this.cookieBanner = document.getElementById('cookie-banner');
    }
    if (this.cookieConsent === null && document.getElementById('cookie-consent') !== null) {
      this.cookieConsent = document.getElementById('cookie-consent');
    }

    if (consentCookie === true) {
      this.executeAnalyticScript();
      this.executeAdsScript();
      return;
    }

    if (consentCookie === false) {
      if (analyticConsent === true) {
        this.executeAnalyticScript();
        return;
      }
      if (adsConsent === true) {
        this.executeAdsScript();
        return;
      }
      // so do Not Track Is Activated
      this.hideBanner();
      return;
    }

    // we dont have a consent cookie so, we show the banner
    if (this.isDoNotTrackActive()) {
      if (typeof analyticConsent === 'undefined') {
        Cookies.set('analyticConsentValue', false, { expires: 395 });
      }
      if (typeof adsConsent === 'undefined') {
        Cookies.set('analyticConsentValue', false, { expires: 395 });
      }
      if (consentCookie) {
        Cookies.set('hasFullConsent', false, { expires: 395 });
      }
    }

    if (this.cookieBanner) {
      this.cookieBanner.classList.add('active');
    }
    if (this.cookieConsent) {
      this.cookieConsent.addEventListener('click', this.removeCookieConsent, false);
    }

    document.addEventListener('click', this.onDocumentClick, false);
    document.addEventListener('scroll', this.onDocumentScroll, false);
  };

  onDocumentScroll = (event: Event) => {
    if (
      (document.body && document.body.scrollTop > SCROLL_VALUE_TO_CONSENT) ||
      (document.documentElement && document.documentElement.scrollTop > SCROLL_VALUE_TO_CONSENT)
    ) {
      if (this.isDoNotTrackActive()) {
        this.hideBanner();
        Cookies.set('hasFullConsent', false, { expires: 395 });

        return;
      }
      if (!Cookies.getJSON('hasFullConsent')) {
        this.considerFullConsent();
      }
    }
  };

  hideBanner = () => {
    this.cookieBanner.className = this.cookieBanner.className.replace('active', '').trim();
    document.removeEventListener('click', this.onDocumentClick, false);
    document.removeEventListener('scroll', this.onDocumentClick, false);
  };

  onDocumentClick = (event: Event) => {
    const target = event.target;
    // $FlowFixMe
    if (
      target !== null &&
      // $FlowFixMe
      target.id &&
      (target.id === 'cookie-banner' || target.id === 'cookie-more-button')
    ) {
      return;
    }
    // $FlowFixMe
    if (target !== null && target.className && target.className.search('cookie-manager') !== -1) {
      return;
    }
    if (
      (target !== null &&
        // $FlowFixMe
        target.parentNode !== null &&
        target.parentNode.className &&
        target.parentNode.className.search('cookie-manager') !== -1) ||
      // $FlowFixMe
      target.parentNode.id === 'cookie-banner' ||
      target.parentNode.id === 'cookie-banner' ||
      target.parentNode.id === 'cookie-more-button' ||
      target.parentNode.id === 'cookies-cancel'
    ) {
      return;
    }
    if (
      (target !== null &&
        target.parentNode !== null &&
        target.parentNode.parentNode !== null &&
        target.parentNode.parentNode.id === 'cookie-banner') ||
      target.parentNode.parentNode.className.search('cookie-manager') !== -1
    ) {
      return;
    }

    if (this.isDoNotTrackActive()) {
      Cookies.set('hasFullConsent', false, { expires: 395 });
      this.hideBanner();
      return;
    }

    // user clicked on close cookie banner
    // $FlowFixMe
    if (target.id === 'cookie-consent') {
      this.considerFullConsent();
      return;
    }
    this.considerFullConsent();
  };

  considerFullConsent = () => {
    Cookies.set('hasFullConsent', true, { expires: 395 });
    if (this.analyticCookieValue() !== true) {
      this.setCookie(true, 'analyticConsentValue');
      this.executeAnalyticScript(true);
    }
    if (this.adCookieConsentValue() !== true) {
      this.setCookie(true, 'adCookieConsentValue');
      this.executeAdsScript();
    }
    this.hideBanner();
  };

  doNotConsiderFullConsent = () => {
    Cookies.set('hasFullConsent', false, { expires: 395 });
    this.hideBanner();
  };

  setCookie = (value: boolean, type: string) => {
    Cookies.set(type, value, { expires: 395 });

    return true;
  };

  getCookieDomain = (): string => {
    return window.location.host;
  };

  changeGaExpireAt = (expire: string) => {
    GA_COOKIE_NAMES.forEach(name => {
      if (typeof Cookies.get(name) !== 'undefined') {
        this.expireCookie(name, this.getCookieDomain(), expire);
      }
    });
    ATI_COOKIE_NAMES.forEach(name => {
      if (typeof Cookies.get(name) !== 'undefined') {
        this.expireCookie(name, this.getCookieDomain(), expire);
      }
    });
  };

  toggleCookie = (value: boolean, type: string) => {
    Cookies.set(type, value, { expires: 395 });
    const cookies = this.getCookies();
    if (type === 'analyticConsentValue') {
      if (value) {
        this.executeAnalyticScript(true);
      } else {
        this.changeGaExpireAt(new Date().toUTCString());
        PK_COOKIE_NAMES.forEach(name => {
          cookies.forEach(cookie => {
            if (cookie.startsWith(name)) {
              this.expireCookie(cookie, null, new Date().toUTCString());
            }
          });
        });
        ATI_COOKIE_NAMES.forEach(name => {
          cookies.forEach(cookie => {
            if (cookie.startsWith(name)) {
              this.expireCookie(cookie, null, new Date().toUTCString());
            }
          });
        });
      }
    } else if (type === 'adCookieConsentValue') {
      if (value) {
        this.executeAdsScript();
      }
      GTAG_COOKIE_NAMES.forEach(name => {
        if (typeof Cookies.get(name) !== 'undefined') {
          this.expireCookie(name, this.getCookieDomain(), new Date().toUTCString());
        }
      });
    }
  };

  expireCookie = (coockieName: string, domain: ?string, expireAt: string): void => {
    document.cookie =
      coockieName + '=; expires=' + expireAt + (domain ? '; domain=.' + domain : '') + '; path=/';
  };

  getCookies = () => {
    let k = 0;
    return document.cookie.split(';').reduce((cookies, cookie) => {
      let [name] = cookie.split('=').map(c => c.trim());
      cookies[k] = name;
      k++;
      return cookies;
    }, []);
  };

  analyticCookieValue = () => {
    return Cookies.getJSON('analyticConsentValue');
  };

  adCookieConsentValue = () => {
    return Cookies.getJSON('adCookieConsentValue');
  };

  removeCookieConsent = (event: Event) => {
    const cookieChoiceElement = document.getElementById(this.cookieConsent);
    if (cookieChoiceElement != null && cookieChoiceElement.parentNode) {
      cookieChoiceElement.parentNode.removeChild(cookieChoiceElement);
    }
  };

  executeAnalyticScript(changeExpiration: ?boolean) {
    window._capco_executeAnalyticScript();
    if (typeof changeExpiration !== 'undefined' && changeExpiration === true) {
      const expireIn13Months = new Date();
      expireIn13Months.setMonth(expireIn13Months.getMonth() + 13);
      setTimeout(() => {
        this.changeGaExpireAt(expireIn13Months.toUTCString());
      }, 1000);
    }
  }

  executeAdsScript() {
    window._capco_executeAdsScript();
  }

  isFullConsent = () => {
    return Cookies.getJSON('hasFullConsent');
  };
}

export default new CookieMonster();
