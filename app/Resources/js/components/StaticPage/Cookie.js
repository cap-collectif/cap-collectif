// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Col, Alert } from 'react-bootstrap';
import Toggle from 'react-toggle';
import config from '../../config';
import CookieMonster from '../../CookieMonster';
import FluxDispatcher from '../../dispatchers/AppDispatcher';

type Props = {
  analyticsJs: ?string,
  adJs: ?string,
};

type CookieState = {
  isAnalyticEnabled: boolean,
  isAdvertisingEnabled: boolean,
};

export class Cookie extends React.Component<Props, CookieState> {
  constructor() {
    super();
    this.state = {
      isAdvertisingEnabled:
        config.canUseDOM &&
        (typeof CookieMonster.adCookieConsentValue() === 'undefined' ||
        CookieMonster.adCookieConsentValue() === false
          ? false
          : CookieMonster.setCookie(true, 'adCookieConsentValue')),
      isAnalyticEnabled:
        config.canUseDOM &&
        (typeof CookieMonster.analyticCookieValue() === 'undefined' ||
        CookieMonster.analyticCookieValue() === false
          ? false
          : CookieMonster.setCookie(true, 'analyticConsentValue')),
    };
  }

  componentDidMount() {
    setTimeout(() => {
      const cookieConsent = document.getElementById('cookie-consent');

      if (cookieConsent) {
        cookieConsent.addEventListener(
          'click',
          () => {
            this.toggleCookies(true);
          },
          false,
        );
      }
    }, 100);
  }

  toggleAnalyticCookies = (value: boolean): void => {
    this.setState({
      isAnalyticEnabled: value,
    });
  };

  toggleAdvertisingCookies = (value: boolean): void => {
    this.setState({
      isAdvertisingEnabled: value,
    });
  };

  toggleCookies = (value: boolean): void => {
    this.setState({
      isAnalyticEnabled: value,
      isAdvertisingEnabled: value,
    });
  };

  saveCookiesConfiguration = (): void => {
    const { isAnalyticEnabled, isAdvertisingEnabled } = this.state;
    CookieMonster.toggleCookie(isAnalyticEnabled, 'analyticConsentValue');
    CookieMonster.toggleCookie(isAdvertisingEnabled, 'adCookieConsentValue');
    if (isAnalyticEnabled && isAdvertisingEnabled && CookieMonster.isFullConsent() !== true) {
      CookieMonster.considerFullConsent();
    } else {
      CookieMonster.doNotConsiderFullConsent();
    }
    FluxDispatcher.dispatch({
      actionType: 'UPDATE_ALERT',
      alert: { bsStyle: 'success', content: 'your-settings-have-been-saved-successfully' },
    });
  };

  render() {
    const { isAnalyticEnabled, isAdvertisingEnabled } = this.state;
    const { analyticsJs, adJs } = this.props;
    return (
      <div className="container w-auto cookie-manager">
        <div className="row mt-10 cookie-manager" id="cookies-manager">
          {config.canUseDOM && CookieMonster.isDoNotTrackActive() && (
            <Alert bsStyle="info" className="row cookie-manager" id="cookies-alert">
              <Col sm={1} className="cookie-manager">
                <div className="col-top font-size-30 cookie-manager ">
                  <i className="cap cap-information-1" />
                </div>
              </Col>
              <Col sm={11} className="cookie-manager">
                <FormattedMessage id="cookies-are-disabled-by-default" />
              </Col>
            </Alert>
          )}
          <FormattedMessage id="cookies.content.page" />
          {analyticsJs && analyticsJs.length > 1 && (
            <div
              className="row cookie-manager"
              style={{ padding: '10px 0' }}
              id="cookies-performance">
              <Col sm={8} className="cookie-manager">
                <strong>
                  <FormattedMessage id="performance" />
                </strong>
              </Col>
              <Col sm={4} className="d-flex justify-content-end cookie-manager">
                <div
                  className={
                    isAnalyticEnabled
                      ? 'color-green cookie-manager mr-10'
                      : 'color-red cookie-manager mr-10'
                  }>
                  <FormattedMessage
                    id={isAnalyticEnabled ? 'list.label_enabled' : 'step.vote_type.disabled'}
                  />
                </div>
                <Toggle
                  id="cookies-enable-analytic"
                  checked={isAnalyticEnabled}
                  className="cookie-manager"
                  onChange={() => this.toggleAnalyticCookies(!isAnalyticEnabled)}
                />
              </Col>
              <Col sm={12} className="color-dark-gray cookie-manager">
                <FormattedMessage id="help-text-performance-option" />
              </Col>
            </div>
          )}
          {adJs && adJs.length > 1 && (
            <div
              className="row cookie-manager"
              style={{ padding: '10px 0' }}
              id="cookies-advertising">
              <Col sm={8} className="cookie-manager">
                <strong>
                  <FormattedMessage id="advertising" />
                </strong>
              </Col>
              <Col sm={4} className="d-flex justify-content-end cookie-manager">
                <div
                  className={
                    isAdvertisingEnabled
                      ? 'color-green cookie-manager mr-10'
                      : 'color-red cookie-manager mr-10'
                  }>
                  <FormattedMessage
                    id={isAdvertisingEnabled ? 'list.label_enabled' : 'step.vote_type.disabled'}
                  />
                </div>
                <Toggle
                  id="cookies-enable-ads"
                  checked={isAdvertisingEnabled}
                  className="cookie-manager"
                  onChange={() => this.toggleAdvertisingCookies(!isAdvertisingEnabled)}
                />
              </Col>
              <Col sm={12} className="color-dark-gray cookie-manager">
                <FormattedMessage id="help-text-advertising-option" />
              </Col>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Cookie;
