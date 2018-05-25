// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Col, Alert } from 'react-bootstrap';
import Toggle from 'react-toggle';
import cookieMonster from '../../cookieMonster';

type Props = {};

type State = {
  isAnalyticEnabled: boolean,
  isAdvertisingEnabled: boolean,
};

export class Cookie extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      isAdvertisingEnabled: !cookieMonster.isDoNotTrackActive(),
      isAnalyticEnabled:
        typeof cookieMonster.analyticCookieValue() === 'undefined'
          ? true
          : cookieMonster.analyticCookieValue(),
    };
  }

  toggleAnalyticCookies = (value: boolean): void => {
    cookieMonster.toggleAnalyticCookies(value);
    this.setState({
      isAnalyticEnabled: value,
    });
  };
  toggleAdvertisingCookies = (value: boolean): void => {
    this.setState({
      isAdvertisingEnabled: value,
    });
  };

  render() {
    const { isAnalyticEnabled, isAdvertisingEnabled } = this.state;
    return (
      <div>
        <div>
          {cookieMonster.isDoNotTrackActive() && (
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
        <div>
          <div className="row" style={{ padding: '10px 0' }}>
            <div>
              <Col sm={8}>
                <strong>
                  <FormattedMessage id="essential" />
                </strong>
              </Col>
              <Col sm={4} className="d-flex flex-end color-green">
                <FormattedMessage id="always-on" />
              </Col>
            </div>
            <Col sm={12} className="color-dark-gray">
              <FormattedMessage id="help-text-essential-option" />
            </Col>
          </div>
        </div>
        <div>
          <div className="row" style={{ padding: '10px 0' }}>
            <div>
              <Col sm={8}>
                <strong>
                  <FormattedMessage id="performance" />
                </strong>
              </Col>
              <Col sm={4} className="d-flex flex-end">
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
        <div>
          <div className="row" style={{ padding: '10px 0' }}>
            <div>
              <Col sm={8}>
                <strong>
                  <FormattedMessage id="advertising" />
                </strong>
              </Col>
              <Col sm={4} className="d-flex flex-end">
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
      </div>
    );
  }
}

export default Cookie;
