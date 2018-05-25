// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Col, Alert } from 'react-bootstrap';
import Toggle from 'react-toggle';
import cookieMonster from '../../cookieMonster';

type Props = {};

type State = {
  isAnalyticEnable: boolean,
  isAdvertisingEnable: boolean,
};

export class Cookie extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      isAdvertisingEnable: !cookieMonster.isDoNotTrackActive(),
      isAnalyticEnable:
        typeof cookieMonster.analyticCookieValue() === 'undefined'
          ? true
          : cookieMonster.analyticCookieValue(),
    };
  }

  toggleAnalyticCookies = (value: boolean): void => {
    cookieMonster.toggleAnalyticCookies(value);
    this.setState({
      isAnalyticEnable: value,
    });
  };
  toggleAdvertisingCookies = (value: boolean): void => {
    this.setState({
      isAdvertisingEnable: value,
    });
  };

  render() {
    const { isAnalyticEnable, isAdvertisingEnable } = this.state;

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
            <Col sm={12} className="color-grey-light">
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
                  className={isAnalyticEnable ? 'color-green' : 'color-red'}
                  style={{ marginRight: 10 }}>
                  <FormattedMessage
                    id={isAnalyticEnable ? 'list.label_enabled' : 'step.vote_type.disabled'}
                  />
                </div>
                <Toggle
                  checked={isAnalyticEnable}
                  onChange={() => this.toggleAnalyticCookies(!isAnalyticEnable)}
                />
              </Col>
            </div>
            <Col sm={12} className="color-grey-light">
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
                  className={isAdvertisingEnable ? 'color-green' : 'color-red'}
                  style={{ marginRight: 10 }}>
                  <FormattedMessage
                    id={isAdvertisingEnable ? 'list.label_enabled' : 'step.vote_type.disabled'}
                  />
                </div>
                <Toggle
                  checked={isAdvertisingEnable}
                  onChange={() => this.toggleAdvertisingCookies(!isAdvertisingEnable)}
                />
              </Col>
            </div>
            <Col sm={12} className="color-grey-light">
              <FormattedMessage id="help-text-advertising-option" />
            </Col>
          </div>
        </div>
      </div>
    );
  }
}

export default Cookie;
