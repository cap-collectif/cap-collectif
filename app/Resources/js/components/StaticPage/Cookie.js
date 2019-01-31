// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Col, Alert, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import Toggle from 'react-toggle';
import config from '../../config';
import cookieMonster from '../../cookieMonster';
import type { State } from '../../types';
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
        (typeof cookieMonster.adCookieConsentValue() === 'undefined' ||
        cookieMonster.adCookieConsentValue() === false
          ? false
          : cookieMonster.setCookie(true, 'adCookieConsentValue')),
      isAnalyticEnabled:
        config.canUseDOM &&
        (typeof cookieMonster.analyticCookieValue() === 'undefined' ||
        cookieMonster.analyticCookieValue() === false
          ? false
          : cookieMonster.setCookie(true, 'analyticConsentValue')),
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

  saveCookiesConfiguration = (): void => {
    const { isAnalyticEnabled, isAdvertisingEnabled } = this.state;
    cookieMonster.toggleCookie(isAnalyticEnabled, 'analyticConsentValue');
    cookieMonster.toggleCookie(isAdvertisingEnabled, 'adCookieConsentValue');
    if (isAnalyticEnabled && isAdvertisingEnabled && cookieMonster.isFullConsent() !== true) {
      cookieMonster.considerFullConsent();
    } else {
      cookieMonster.doNotConsiderFullConsent();
    }
    FluxDispatcher.dispatch({
      actionType: 'UPDATE_ALERT',
      alert: { bsStyle: 'success', content: 'your-settings-have-been-saved-successfully' },
    });
  };

  toggleCookies = (value: boolean): void => {
    this.setState({
      isAnalyticEnabled: value,
      isAdvertisingEnabled: value,
    });
  };

  render() {
    const { isAnalyticEnabled, isAdvertisingEnabled } = this.state;
    const { analyticsJs, adJs } = this.props;

    return (
      <div id="cookies-manager">
        <div>
          {config.canUseDOM && cookieMonster.isDoNotTrackActive() && (
            <Alert bsStyle="info" className="row">
              <Col sm={1}>
                <div style={{ fontSize: 30, verticalAlign: 'top' }}>
                  <i className="cap cap-information-1" />
                </div>
              </Col>
              <Col sm={11}>
                <FormattedMessage id="cookies-are-disabled-by-default" />
              </Col>
            </Alert>
          )}
        </div>
        {analyticsJs && analyticsJs.length > 1 && (
          <div>
            <div className="row" style={{ padding: '10px 0' }} id="cookies-performance">
              <div>
                <Col sm={8}>
                  <strong>
                    <FormattedMessage id="performance" />
                  </strong>
                </Col>
                <Col sm={4} className="d-flex justify-content-end">
                  <div
                    className={isAnalyticEnabled ? 'color-green' : 'color-red'}
                    style={{ marginRight: 10 }}>
                    <FormattedMessage
                      id={isAnalyticEnabled ? 'list.label_enabled' : 'step.vote_type.disabled'}
                    />
                  </div>
                  <Toggle
                    checked={isAnalyticEnabled}
                    onChange={() => this.toggleAnalyticCookies(!isAnalyticEnabled)}
                  />
                </Col>
              </div>
              <Col sm={12} className="color-dark-gray">
                <FormattedMessage id="help-text-performance-option" />
              </Col>
            </div>
          </div>
        )}
        {adJs && adJs.length > 1 && (
          <div>
            <div className="row" style={{ padding: '10px 0' }} id="cookies-advertising">
              <div>
                <Col sm={8}>
                  <strong>
                    <FormattedMessage id="advertising" />
                  </strong>
                </Col>
                <Col sm={4} className="d-flex justify-content-end">
                  <div
                    className={isAdvertisingEnabled ? 'color-green' : 'color-red'}
                    style={{ marginRight: 10 }}>
                    <FormattedMessage
                      id={isAdvertisingEnabled ? 'list.label_enabled' : 'step.vote_type.disabled'}
                    />
                  </div>
                  <Toggle
                    checked={isAdvertisingEnabled}
                    onChange={() => this.toggleAdvertisingCookies(!isAdvertisingEnabled)}
                  />
                </Col>
              </div>
              <Col sm={12} className="color-dark-gray">
                <FormattedMessage id="help-text-advertising-option" />
              </Col>
            </div>
          </div>
        )}
        {(adJs && adJs.length > 1) ||
          (analyticsJs && analyticsJs.length > 1 && (
            <div>
              <div className="row" style={{ padding: '10px 0' }} id="cookies-management-save">
                <Button
                  className="ml-15 btn-primary"
                  id="cookies-save"
                  onClick={() => {
                    this.saveCookiesConfiguration();
                  }}>
                  <FormattedMessage id="global.save" />
                </Button>
              </div>
            </div>
          ))}
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  analyticsJs: state.default.parameters['snalytical-tracking-scripts-on-all-pages'],
  adJs: state.default.parameters['ad-scripts-on-all-pages'],
});

export default connect(mapStateToProps)(Cookie);
