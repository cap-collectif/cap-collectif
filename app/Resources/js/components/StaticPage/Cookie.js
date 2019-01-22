// @flow
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Col, Alert, Button} from 'react-bootstrap';
import {connect} from 'react-redux';
import Toggle from 'react-toggle';
import config from '../../config';
import CookieMonster from '../../CookieMonster';
import type {State} from '../../types';
import FluxDispatcher from '../../dispatchers/AppDispatcher';

type Props = {
  analyticsJs: ?string,
  adJs: ?string,
};

type CookieState = {
  isAnalyticEnabled: boolean,
  isAdvertisingEnabled: boolean,
};

export const saveCookiesConfiguration = (): void => {
  const {isAnalyticEnabled, isAdvertisingEnabled} = this.state;
  CookieMonster.toggleCookie(isAnalyticEnabled, 'analyticConsentValue');
  CookieMonster.toggleCookie(isAdvertisingEnabled, 'adCookieConsentValue');
  if (isAnalyticEnabled && isAdvertisingEnabled && CookieMonster.isFullConsent() !== true) {
    CookieMonster.considerFullConsent();
  } else {
    CookieMonster.doNotConsiderFullConsent();
  }
  FluxDispatcher.dispatch({
    actionType: 'UPDATE_ALERT',
    alert: {bsStyle: 'success', content: 'your-settings-have-been-saved-successfully'},
  });
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

  render() {
    const {isAnalyticEnabled, isAdvertisingEnabled} = this.state;
    const {analyticsJs, adJs} = this.props;
    return (
      <div>
        <section className="section--custom">
          <div className="container w-auto" style={{width: 'auto'}}>
              <FormattedMessage id='cookies.content.page'/>
            <div className="row mt-10">
              <div className="col-xs-12 col-sm-8 col-md-12">
                <div id="cookies-manager">
                  <div>
                    {config.canUseDOM && CookieMonster.isDoNotTrackActive() && (
                      <Alert bsStyle="info" className="row">
                        <Col sm={1}>
                          <div style={{fontSize: 30, verticalAlign: 'top'}}>
                            <i className="cap cap-information-1"/>
                          </div>
                        </Col>
                        <Col sm={11}>
                          <FormattedMessage id="cookies-are-disabled-by-default"/>
                        </Col>
                      </Alert>
                    )}
                  </div>
                  {analyticsJs && analyticsJs.length > 1 && (
                    <div>
                      <div className="row" style={{padding: '10px 0'}} id="cookies-performance">
                        <div>
                          <Col sm={8}>
                            <strong>
                              <FormattedMessage id="performance"/>
                            </strong>
                          </Col>
                          <Col sm={4} className="d-flex justify-content-end">
                            <div
                              className={isAnalyticEnabled ? 'color-green' : 'color-red'}
                              style={{marginRight: 10}}>
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
                          <FormattedMessage id="help-text-performance-option"/>
                        </Col>
                      </div>
                    </div>
                  )}
                  {adJs && adJs.length > 1 && (
                    <div>
                      <div className="row" style={{padding: '10px 0'}} id="cookies-advertising">
                        <div>
                          <Col sm={8}>
                            <strong>
                              <FormattedMessage id="advertising"/>
                            </strong>
                          </Col>
                          <Col sm={4} className="d-flex justify-content-end">
                            <div
                              className={isAdvertisingEnabled ? 'color-green' : 'color-red'}
                              style={{marginRight: 10}}>
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
                          <FormattedMessage id="help-text-advertising-option"/>
                        </Col>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  analyticsJs: state.default.parameters['snalytical-tracking-scripts-on-all-pages'],
  adJs: state.default.parameters['ad-scripts-on-all-pages'],
});

export default connect(mapStateToProps)(Cookie);
