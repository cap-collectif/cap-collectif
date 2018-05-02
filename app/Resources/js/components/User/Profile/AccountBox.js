// @flow
import React, { Component } from 'react';
import {
  Alert,
  Panel,
  ButtonToolbar,
  Button,
} from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import {
  reduxForm,
  type FormProps,
  Field,
  SubmissionError,
} from 'redux-form';
import {FormattedMessage, injectIntl, FormattedHTMLMessage, IntlShape} from 'react-intl';
import {createFragmentContainer, graphql} from "react-relay";
import ConfirmPasswordModal from '../ConfirmPasswordModal';
import {cancelEmailChange, confirmPassword, resendConfirmation} from '../../../redux/modules/user';
import type {Dispatch, State} from '../../../types';
import component from "../../Form/Field";
import AlertForm from "../../Alert/AlertForm";
import UpdateProfilePublicDataMutation from "../../../mutations/UpdateProfilePublicDataMutation";
import type AccountBox_viewer from './__generated__/AccountBox_viewer.graphql';

type Props = FormProps &
  RelayProps & {
  intl: IntlShape,
  initialValues: Object,
  viewer: AccountBox_viewer,
  confirmationEmailResent: boolean,
  newEmailToConfirm: string
};
const formName = "account";

const validate = (values: Object) => {
  const errors = {};

  const fields = ['email', 'timezone', 'locale'];
  fields.forEach(value => {
    if (value === 'email') {
      if (!values[value] || values[value].length === 0) {
        errors[value] = 'fill-field';
      }
    }
    if (values[value] && values[value].length <= 2) {
      errors[value] = 'two-characters-minimum-required';
    }
    if (value !== 'biography') {
      if (values[value] && values[value].length > 256) {
        errors[value] = '256-characters-maximum-required';
      }
    }
  });

  return errors;
};

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const {intl} = props;
  const media = typeof values.media !== 'undefined' && values.media !== null ? values.media.id : null;
  delete values.media;
  const input = {
    ...values,
    media,
    userId: props.viewer.id
  };

  return UpdateProfilePublicDataMutation.commit({input})
    .then(response => {
      if (!response.updateProfilePublicData || !response.updateProfilePublicData.viewer) {
        throw new Error('Mutation "updateProfilePublicData" failed.');
      }
    })
    .catch(response => {
      if (response.response.message) {
        throw new SubmissionError({
          _error: response.response.message,
        });
      } else {
        throw new SubmissionError({
          _error: intl.formatMessage({id: 'global.error.server.form'}),
        });
      }
    });
};

export class AccountBox extends Component<Props> {
  render() {
    const {
      viewer,
      invalid,
      valid,
      dispatch,
      submitSucceeded,
      submitFailed,
      handleSubmit,
      submitting,
      error,
      newEmailToConfirm,
      confirmationEmailResent
    } = this.props;
    return (
      <Panel>
        <h2 className="card__title">
          <FormattedMessage id="profile.account.title" />
        </h2>
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
          <div className="capco_horizontal_field_with_border_top" style={{border: 0}}>
            <label className="col-sm-3 control-label">
              <FormattedMessage id="proposal.vote.form.email"/>
            </label>
            <div>
              <Field
                name="email"
                component={component}
                type="text"
                id="account-form-email"
                divClassName="col-sm-6"
              />
            </div>
          </div>
          <div className="capco_horizontal_field_with_border_top" style={{border: 0}}>
            <label className="col-sm-3 control-label">
              <FormattedMessage id="proposal.vote.form.email"/>
            </label>
            <div>
              <Field
                name="locale"
                component={component}
                type="text"
                id="account-form-email"
                divClassName="col-sm-6"
              />
            </div>
          </div>
          <div className="capco_horizontal_field_with_border_top" style={{border: 0}}>
            <label className="col-sm-3 control-label">
              <FormattedMessage id="proposal.vote.form.email"/>
            </label>
            <div>
              <Field
                name="timezone"
                component={component}
                type="text"
                id="account-form-email"
                divClassName="col-sm-6"
              />
            </div>
          </div>
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
        <ConfirmPasswordModal />
        <div className="clearfix"></div>
        <div className="col-sm-3"></div>
        <div className="capco_horizontal_field_with_border_top">
          <div className="col-sm-3"></div>
          <ButtonToolbar className="col-sm-4 pl-0">
            <Button
              disabled={invalid || submitting}
              type="submit"
              bsStyle="primary"
              id="personal-data-form-save"
            >
              <FormattedMessage id={submitting ? 'global.loading' : 'global.save_modifications'}/>
            </Button>
            <AlertForm
              valid={valid}
              invalid={invalid}
              errorMessage={error}
              submitSucceeded={submitSucceeded}
              submitFailed={submitFailed}
              submitting={submitting}
            />
          </ButtonToolbar>
        </div>
      </Panel>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: Props) => ({
  newEmailToConfirm: state.user.user && state.user.user.newEmailToConfirm,
  confirmationEmailResent: state.user.confirmationEmailResent,
  initialValues: {
    email: props.viewer.email,
    timezone: props.viewer.timezone ? props.viewer.timezone : null,
    locale: props.viewer.locale ? props.viewer.locale : null
  }
});

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(AccountBox);

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(
  container,
  graphql`
    fragment AccountBox_viewer on User {
      id
      email
      locale
      timezone
    }
  `,
);
