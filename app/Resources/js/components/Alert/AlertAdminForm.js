import * as React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import AlertAdminFormSucceededMessage from './AlertAdminFormSucceededMessage';

type Props = {
  valid: boolean,
  invalid: boolean,
  submitting: boolean,
  submitSucceeded: boolean,
  submitFailed: boolean,
};

export class AlertAdminForm extends React.Component<Props> {
  render() {
    const { valid, invalid, submitSucceeded, submitFailed, submitting } = this.props;

    return (
      <div>
        {valid && submitSucceeded && !submitting && <AlertAdminFormSucceededMessage />}
        {invalid && (
          <div className="alert__admin-form_invalid-field">
            <i className="icon ion-ios-close-outline" />{' '}
            <FormattedMessage id="global.invalid.form" />
          </div>
        )}
        {submitFailed && (
          <div className="alert__admin-form_server-failed-message">
            <i className="icon ion-ios-close-outline" />{' '}
            <FormattedMessage id="global.error.server.form" />{' '}
            <FormattedHTMLMessage id="global.contact.assistance" />
          </div>
        )}
      </div>
    );
  }
}

export default AlertAdminForm;
