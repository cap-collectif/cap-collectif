/* eslint-disable */
// @flow
import type { ForOrAgainstValue } from '~relay/AddDebateAnonymousVoteMutation.graphql';

const DEBATE_ANONYMOUS_VOTES_NAME = 'CapcoAnonVotes';

const DEBATE_ANONYMOUS_ARGUMENTS_NAME = 'CapcoAnonArguments';

const GA_COOKIE_NAMES = ['__utma', '__utmb', '__utmc', '__utmz', '_ga', '_gat', '_gid'];

const FACEBOOK_COOKIE_NAMES = ['_fbp'];

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

type DebateAnonymousVoteValue = {| type: ForOrAgainstValue, token: string |};

type DebateAnonymousVotesCookie = {|
  [debateId: string]: DebateAnonymousVoteValue,
|};

type DebateAnonymousArgumentValue = {| type: ForOrAgainstValue, token: string, id: string |};

type DebateAnonymousArgumentsCookie = {|
  [debateId: string]: DebateAnonymousArgumentValue,
|};

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
    if (typeof window._capco_ga_cookie_value === 'undefined') {
      // $FlowFixMe
      window._capco_ga_cookie_value = Cookies.getJSON('_ga');
    }
  }

  getDebateAnonymousVoteCookie = (debateId: string): DebateAnonymousVoteValue | null => {
    const votes: DebateAnonymousVotesCookie = Cookies.get(DEBATE_ANONYMOUS_VOTES_NAME)
      ? JSON.parse(atob(Cookies.get(DEBATE_ANONYMOUS_VOTES_NAME)))
      : {};
    if (debateId in votes) return votes[debateId];
    return null;
  };

  getHashedDebateAnonymousVoteCookie = (debateId: string): string | null => {
    const votes: DebateAnonymousVotesCookie = Cookies.get(DEBATE_ANONYMOUS_VOTES_NAME)
      ? JSON.parse(atob(Cookies.get(DEBATE_ANONYMOUS_VOTES_NAME)))
      : {};
    if (debateId in votes) {
      const vote: DebateAnonymousVoteValue = votes[debateId];
      return btoa(`${vote.type}:${vote.token}`);
    }
    return null;
  };

  hasDebateAnonymousVoteCookie = (debateId: string): boolean =>
    !!this.getDebateAnonymousVoteCookie(debateId);

  addDebateAnonymousVoteCookie = (
    debateId: string,
    { type, token }: DebateAnonymousVoteValue,
  ): void => {
    const votes: DebateAnonymousVotesCookie = Cookies.get(DEBATE_ANONYMOUS_VOTES_NAME)
      ? JSON.parse(atob(Cookies.get(DEBATE_ANONYMOUS_VOTES_NAME)))
      : {};
    votes[debateId] = {
      type,
      token,
    };
    Cookies.set(DEBATE_ANONYMOUS_VOTES_NAME, btoa(JSON.stringify(votes)), {
      expires: 395,
      secure: true,
      sameSite: 'None',
    });
  };

  removeDebateAnonymousVoteCookie = (debateId: string): void => {
    const votes: DebateAnonymousVotesCookie = Cookies.get(DEBATE_ANONYMOUS_VOTES_NAME)
      ? JSON.parse(atob(Cookies.get(DEBATE_ANONYMOUS_VOTES_NAME)))
      : {};
    if (debateId in votes) {
      delete votes[debateId];
    }
    Cookies.set(DEBATE_ANONYMOUS_VOTES_NAME, btoa(JSON.stringify(votes)), {
      expires: 395,
      secure: true,
      sameSite: 'None',
    });
  };

  getDebateAnonymousArgumentCookie = (debateId: string): DebateAnonymousArgumentValue | null => {
    const args: DebateAnonymousArgumentsCookie = Cookies.get(DEBATE_ANONYMOUS_ARGUMENTS_NAME)
      ? JSON.parse(atob(Cookies.get(DEBATE_ANONYMOUS_ARGUMENTS_NAME)))
      : {};
    if (debateId in args) return args[debateId];
    return null;
  };

  getHashedDebateAnonymousArgumentCookie = (debateId: string): string | null => {
    const args: DebateAnonymousArgumentsCookie = Cookies.get(DEBATE_ANONYMOUS_ARGUMENTS_NAME)
      ? JSON.parse(atob(Cookies.get(DEBATE_ANONYMOUS_ARGUMENTS_NAME)))
      : {};
    if (debateId in args) {
      const arg: DebateAnonymousArgumentValue = args[debateId];
      return btoa(`${arg.type}:${arg.token}`);
    }
    return null;
  };

  hasDebateAnonymousArgumentCookie = (debateId: string): boolean =>
    !!this.getDebateAnonymousArgumentCookie(debateId);

  addDebateAnonymousArgumentCookie = (
    debateId: string,
    { type, token, id }: DebateAnonymousArgumentValue,
  ): void => {
    const args: DebateAnonymousArgumentsCookie = Cookies.get(DEBATE_ANONYMOUS_ARGUMENTS_NAME)
      ? JSON.parse(atob(Cookies.get(DEBATE_ANONYMOUS_ARGUMENTS_NAME)))
      : {};
    args[debateId] = {
      type,
      token,
      id,
    };
    Cookies.set(DEBATE_ANONYMOUS_ARGUMENTS_NAME, btoa(JSON.stringify(args)), {
      expires: 395,
      secure: true,
      sameSite: 'None',
    });
  };

  removeDebateAnonymousArgumentCookie = (debateId: string): void => {
    const args: DebateAnonymousArgumentsCookie = Cookies.get(DEBATE_ANONYMOUS_ARGUMENTS_NAME)
      ? JSON.parse(atob(Cookies.get(DEBATE_ANONYMOUS_ARGUMENTS_NAME)))
      : {};
    if (debateId in args) {
      delete args[debateId];
    }
    Cookies.set(DEBATE_ANONYMOUS_ARGUMENTS_NAME, btoa(JSON.stringify(args)), {
      expires: 395,
      secure: true,
      sameSite: 'None',
    });
  };

  isDoNotTrackActive = () => {
    const doNotTrack = navigator.doNotTrack;
    return doNotTrack === 'yes' || doNotTrack === '1';
  };

  checkCookieHtmlElement = () => {
    if (this.cookieBanner === null && document.getElementById('cookie-banner') !== null) {
      this.cookieBanner = document.getElementById('cookie-banner');
    }

    if (this.cookieConsent === null && document.getElementById('cookie-consent') !== null) {
      this.cookieConsent = document.getElementById('cookie-consent');
    }
  };

  processCookieConsent = () => {
    const consentCookie = Cookies.getJSON('hasFullConsent');
    const analyticConsent = Cookies.getJSON('analyticConsentValue');
    const adsConsent = Cookies.getJSON('adCookieConsentValue');

    this.checkCookieHtmlElement();

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
  };

  hideBanner = () => {
    this.checkCookieHtmlElement();
    this.cookieBanner.className = this.cookieBanner.className.replace('active', '').trim();
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

  doNotConsiderFullConsent = (fromBanner: boolean = false) => {
    Cookies.set('hasFullConsent', false, { expires: 395 });
    if (fromBanner) {
      this.setCookie(false, 'adCookieConsentValue');
      this.setCookie(false, 'analyticConsentValue');
    }

    this.hideBanner();
  };

  setCookie = (value: any, type: string) => {
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
      FACEBOOK_COOKIE_NAMES.forEach(name => {
        cookies.forEach(cookie => {
          if (cookie.startsWith(name)) {
            this.expireCookie(cookie, null, new Date().toUTCString());
          }
        });
      });

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

  changePixelExpireAt = (expire: string) => {
    FACEBOOK_COOKIE_NAMES.forEach(name => {
      if (typeof Cookies.get(name) !== 'undefined') {
        this.expireCookie(name, this.getCookieDomain(), expire);
      }
    });
  };

  executeAdsScript(changeExpiration: ?boolean) {
    window._capco_executeAdsScript();
    if (typeof changeExpiration !== 'undefined' && changeExpiration === true) {
      const expireIn13Months = new Date();
      expireIn13Months.setMonth(expireIn13Months.getMonth() + 13);
      setTimeout(() => {
        this.changePixelExpireAt(expireIn13Months.toUTCString());
      }, 1000);
    }
  }

  isFullConsent = () => {
    return Cookies.getJSON('hasFullConsent');
  };

  changeCookieExpireAt = (cookies: string[], expire: string) => {
    cookies.forEach(name => {
      if (typeof Cookies.get(name) !== 'undefined') {
        this.expireCookie(name, this.getCookieDomain(), expire);
      }
    });
  };

  setCookieWithExpirationDate = (value: any, type: string, duration: number) => {
    Cookies.set(type, value, { expires: duration, secure: true, sameSite: 'Strict' });
    return true;
  };

  getTimeDifference = ({ day, month }: { day?: number, month?: number }): number => {
    const start = new Date();
    const end = new Date();
    if (day) {
      end.setMonth(day);
    }

    if (month) {
      end.setMonth(month);
    }
    return end.getTime() - start.getTime();
  };

  setLocale = (locale: string) => {
    this.setCookieWithExpirationDate(locale, 'locale', this.getTimeDifference({ month: 13 }));
  };

  getLocale = () => {
    return Cookies.getJSON('locale');
  };
}

export default new CookieMonster();
