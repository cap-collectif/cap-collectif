import * as React from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
  valid : boolean,
  invalid: boolean,
  isSaved: boolean,
  submitting: boolean,
  hasServerError: boolean,
};

class AlertAdminForm extends React.Component<Props> {

  render() {
    const { valid, invalid, isSaved, hasServerError, submitting } = this.props;

    return (
      <div>
        { valid &&
          isSaved &&
          !submitting &&
          <div className="alert__admin-form_succeeded-action">
              <i className="fa fa-check-square-o" aria-hidden="true"></i> <FormattedMessage id="global.saved"/>
          </div>
        }
        { invalid &&
          <div className="alert__admin-form_invalid-field">
            <i className="fa fa-times" aria-hidden="true"></i> <FormattedMessage id="global.invalid.form" />
          </div>
        }
        { hasServerError &&
          <div className="alert__admin-form_server-failed-action">
            <i className="fa fa-times" aria-hidden="true"></i> <FormattedMessage id="global.server.error.form" />
          </div>
        }
      </div>
    );
  }
}

export default AlertAdminForm;
