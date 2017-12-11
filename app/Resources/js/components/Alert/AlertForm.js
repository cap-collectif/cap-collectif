import * as React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import AlertFormSucceededMessage from './AlertFormSucceededMessage';

type Props = {
  valid: boolean,
  invalid: boolean,
  submitting: boolean,
  submitSucceeded: boolean,
  submitFailed: boolean,
  errorMessage: ?string,
};

export class AlertForm extends React.Component<Props> {
  render() {
    const { valid, invalid, submitSucceeded, submitFailed, submitting, errorMessage } = this.props;

    if (errorMessage) {
      return (
        <div className="alert__form_server-failed-message">
          <i className="cap cap-ios-close-outline" /> <FormattedHTMLMessage id={errorMessage} />
        </div>
      );
    }

    return (
      <div className="d-ib">
        {valid && submitSucceeded && !submitting && <AlertFormSucceededMessage />}
        {invalid && (
          <div className="alert__form_invalid-field">
            <i className="cap cap-ios-close-outline" />{' '}
            <FormattedMessage id="global.invalid.form" />
          </div>
        )}
        {submitFailed && (
          <div className="alert__form_server-failed-message">
            <i className="cap cap-ios-close-outline" />{' '}
            <FormattedHTMLMessage id="global.error.server.form" />
          </div>
        )}
      </div>
    );
  }
}

export default AlertForm;
