// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { Alert } from 'react-bootstrap';
import { reduxForm, Field } from 'redux-form';
import {
  submitAccountForm as onSubmit,
  resendConfirmation,
  cancelEmailChange,
} from '../../../redux/modules/user';
import { isEmail } from '../../../services/Validator';
import renderComponent from '../../Form/Field';
import type { State } from '../../../types';

export const form = 'account';
const validate = (
  values: { email: ?string },
  props: { initialValues: { email: string } },
): { email: ?string } => {
  const errors = {};
  if (!values.email) {
    errors.email = 'global.required';
  } else if (!isEmail(values.email)) {
    errors.email = 'proposal.vote.constraints.email';
  }
  if (values.email === props.initialValues.email) {
    errors.email = 'global.change.required';
  }
  return errors;
};

export const AccountForm = React.createClass({
  propTypes: {
    newEmailToConfirm: PropTypes.string,
    error: PropTypes.string,
    initialValues: PropTypes.object.isRequired,
    confirmationEmailResent: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  },

  render() {
    const {
      initialValues,
      dispatch,
      handleSubmit,
      confirmationEmailResent,
      error,
      newEmailToConfirm,
    } = this.props;
    return (
      <form onSubmit={handleSubmit} className="form-horizontal">
        {error && (
          <Alert bsStyle="danger">
            <p>
              <FormattedHTMLMessage id={error} />
            </p>
          </Alert>
        )}
        {confirmationEmailResent && (
          <Alert bsStyle="warning">
            <FormattedMessage id="account.email_confirmation_sent" />
          </Alert>
        )}
        <Field
          type="email"
          component={renderComponent}
          name="email"
          id="account__email"
          labelClassName="col-sm-4"
          wrapperClassName="col-sm-6"
          label={<FormattedMessage id="proposal.vote.form.email" />}
        />
        <p className="small excerpt col-sm-6 col-sm-offset-4">
          <FormattedMessage id="account.your_email_is_not_public" />
        </p>
        {newEmailToConfirm && (
          <div className="col-sm-6 col-sm-offset-4">
            <p className="small excerpt">
              <FormattedHTMLMessage
                id="user.confirm.profile_help"
                values={{ email: newEmailToConfirm }}
              />
            </p>
            <p className="small excerpt">
              <a href="#resend" onClick={() => resendConfirmation()}>
                <FormattedMessage id="user.confirm.resend" />
              </a>
              {' · '}
              <a href="#cancel" onClick={() => cancelEmailChange(dispatch, initialValues.email)}>
                <FormattedMessage id="user.confirm.cancel" />
              </a>
            </p>
          </div>
        )}
      </form>
    );
  },
});

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  newEmailToConfirm: state.user.user && state.user.user.newEmailToConfirm,
  confirmationEmailResent: state.user.confirmationEmailResent,
  initialValues: {
    email: state.user.user && state.user.user.email,
  },
});

export default connect(mapStateToProps)(
  reduxForm({
    form,
    validate,
    onSubmit,
  })(AccountForm),
);
