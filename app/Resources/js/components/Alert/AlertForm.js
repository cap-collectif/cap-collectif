// @flow
import * as React from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import AlertFormSucceededMessage from './AlertFormSucceededMessage';

type Props = {
  valid: boolean,
  invalid: boolean,
  submitting: boolean,
  submitSucceeded: boolean,
  submitFailed: boolean,
  errorMessage?: string,
};

export const AlertForm = ({
  valid,
  invalid,
  submitSucceeded,
  submitFailed,
  submitting,
  errorMessage,
}: Props) => {
  if (errorMessage) {
    return (
      <div className="d-ib">
        <div className="alert__form_server-failed-message">
          <i className="cap cap-ios-close-outline" /> <FormattedHTMLMessage id={errorMessage} />
        </div>
      </div>
    );
  }

  if (invalid) {
    return (
      <div className="d-ib">
        <div className="alert__form_invalid-field">
          <i className="cap cap-ios-close-outline" /> <FormattedMessage id="global.invalid.form" />
        </div>
      </div>
    );
  }
  return (
    <div className="d-ib">
      {valid && submitSucceeded && !submitting && <AlertFormSucceededMessage />}
      {submitFailed && (
        <div className="alert__form_server-failed-message">
          <i className="cap cap-ios-close-outline" />{' '}
          <FormattedHTMLMessage id="global.error.server.form" />
        </div>
      )}
    </div>
  );
};

export default AlertForm;
