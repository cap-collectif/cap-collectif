import * as React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';

type Props = {
  valid: boolean,
  invalid: boolean,
  pristine: boolean,
  submitting: boolean,
  submitSucceeded: boolean,
  submitFailed: boolean,
};

class AlertAdminForm extends React.Component<Props> {
  render() {
    const { valid, invalid, submitSucceeded, submitFailed, submitting } = this.props;

    return (
      <div>
        {valid &&
          submitSucceeded &&
          !submitting && (
            <div className="alert__admin-form_succeeded-action">
              <i className="icon ion-android-checkmark-circle" />{' '}
              <FormattedMessage id="global.saved" />
            </div>
          )}
        {invalid && (
          <div className="alert__admin-form_invalid-field">
            <i className="icon ion-ios-close-outline" />{' '}
            <FormattedMessage id="global.invalid.form" />
          </div>
        )}
        {submitFailed && (
          <div className="alert__admin-form_server-failed-action">
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
