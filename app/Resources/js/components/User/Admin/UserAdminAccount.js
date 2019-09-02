// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { type FormProps, SubmissionError, reduxForm, Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button } from 'react-bootstrap';
import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import type { GlobalState, Dispatch } from '../../../types';
import UpdateUserAccountMutation from '../../../mutations/UpdateUserAccountMutation';
import type { UserAdminAccount_user } from '~relay/UserAdminAccount_user.graphql';
import DeleteAccountModal from '../DeleteAccountModal';
import SelectUserRole from '../../Form/SelectUserRole';
import DatesInterval from '../../Utils/DatesInterval';

type RelayProps = {|
  user: UserAdminAccount_user,
|};
type Props = {|
  ...FormProps,
  ...RelayProps,
  intl: IntlShape,
  isViewerOrSuperAdmin: boolean,
|};

const formName = 'user-admin-edit-account';
type FormValues = {
  roles: {
    labels: [],
  },
  vip: boolean,
  enabled: boolean,
  locked: boolean,
};

const onSubmit = (values: FormValues, dispatch: Dispatch, { user }: Props) => {
  const roles = values.roles.labels;
  const { vip } = values;
  const { enabled } = values;
  const { locked } = values;
  const input = {
    vip,
    locked,
    enabled,
    roles,
    userId: user.id,
  };

  return UpdateUserAccountMutation.commit({ input })
    .then(response => {
      if (!response.updateUserAccount || !response.updateUserAccount.user) {
        throw new Error('Mutation "updateUserAccount" failed.');
      }
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

const validate = (values: FormValues) => {
  const errors = {};
  if (values.roles.labels.length === 0) {
    errors.roles = '1-option-minimum';
  }

  return errors;
};

type State = {
  showDeleteAccountModal: boolean,
};

export class UserAdminAccount extends React.Component<Props, State> {
  state = {
    showDeleteAccountModal: false,
  };

  render() {
    const {
      pristine,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      user,
      submitting,
      handleSubmit,
      isViewerOrSuperAdmin,
    } = this.props;

    return (
      <div className="box box-primary container-fluid">
        <div className="box-header">
          <h2 className="box-title">
            <FormattedMessage id="user.profile.edit.account" />
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="box-header">
            <h3 className="box-title">
              <FormattedMessage id="admin.fields.step.statuses" />
            </h3>
          </div>
          <div className="box-content box-content__content-form">
            <Field
              name="vip"
              component={component}
              type="checkbox"
              id="vip"
              children={<FormattedMessage id="form.label_vip" />}
            />
            <Field
              name="enabled"
              component={component}
              type="checkbox"
              id="enabled"
              children={<FormattedMessage id="form.label_enabled" />}
            />
            <Field
              name="locked"
              component={component}
              type="checkbox"
              id="locked"
              children={<FormattedMessage id="form.label_locked" />}
            />
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="form.label_real_roles" />
              </h3>
            </div>
            <SelectUserRole id="user_roles" name="roles" label="form.label_real_roles" />
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="subscription" />
              </h3>
            </div>
            <Field
              id="newsletter"
              name="newsletter"
              component={component}
              type="checkbox"
              disabled={!user.isViewer}
              children={
                <div>
                  <FormattedMessage id="newsletter" />{' '}
                  <DatesInterval startAt={user.subscribedToNewsLetterAt} />
                </div>
              }
            />
            <ButtonToolbar className="box-content__toolbar">
              <Button
                type="submit"
                id="user_admin_account_save"
                bsStyle="primary"
                disabled={pristine || invalid || submitting}>
                <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
              </Button>
              {isViewerOrSuperAdmin && (
                <Button
                  id="delete-account-profile-button"
                  bsStyle="danger"
                  onClick={() => {
                    this.setState({ showDeleteAccountModal: true });
                  }}
                  style={{ marginLeft: 15 }}>
                  <FormattedMessage id="global.delete" />
                </Button>
              )}
              <AlertForm
                valid={valid}
                invalid={invalid}
                submitSucceeded={submitSucceeded}
                submitFailed={submitFailed}
                submitting={submitting}
              />
            </ButtonToolbar>
            {isViewerOrSuperAdmin && (
              <DeleteAccountModal
                viewer={user}
                redirectToAdminUrl
                userDeletedIsNotViewer={!user.isViewer}
                show={this.state.showDeleteAccountModal}
                handleClose={() => {
                  this.setState({ showDeleteAccountModal: false });
                }}
              />
            )}
          </div>
        </form>
      </div>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: false,
  form: formName,
})(UserAdminAccount);

const mapStateToProps = (state: GlobalState, { user }: RelayProps) => ({
  initialValues: {
    vip: user.vip,
    enabled: user.enabled,
    locked: user.locked,
    roles: { labels: user.roles, other: null },
    newsletter: user.isSubscribedToNewsLetter,
  },
  isViewerOrSuperAdmin:
    user.isViewer || !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
});

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(container, {
  user: graphql`
    fragment UserAdminAccount_user on User {
      id
      isViewer
      roles
      locked
      vip
      enabled
      isSubscribedToNewsLetter
      subscribedToNewsLetterAt
      ...DeleteAccountModal_viewer
    }
  `,
});
