// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Col } from 'react-bootstrap';
import Toggle from 'react-toggle';
import cookieMonster from '../../cookieMonster';

type Props = {};

type State = {
  isAnalyticEnable: boolean,
};

export class Cookie extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
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

  render() {
    const { isAnalyticEnable } = this.state;

    return (
      <div>
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
      </div>
    );
  }
}

export default Cookie;
