// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { type FormProps, SubmissionError, reduxForm, Field, FieldArray } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { ListGroup, ListGroupItem, Panel, ButtonToolbar, Button } from 'react-bootstrap';
import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import type { Uuid, GlobalState, Dispatch, FeatureToggles } from '../../../types';
import UpdateUserAccountMutation from '../../../mutations/UpdateUserAccountMutation';
import UserAdminAccount_user from './__generated__/UserAdminAccount_user.graphql';

type RelayProps = {
  +user: UserAdminAccount_user,
};
type Props = FormProps &
  RelayProps & {
    +features: FeatureToggles,
    +intl: IntlShape,
    +isSuperAdmin: boolean,
  };

const formName = 'user-admin-edit';

const onSubmit = (values: FormValues, dispatch: Dispatch, { user }: Props) => {

  delete values.newsletter;
  delete values.expired;


  const input = {
    ...values,
    userId: user.id,
  };

  console.log(input);


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

const validate = (values: Object, { user }: Props) => {
  const errors ={};

  return errors;
};

type State = {
};

export class UserAdminAccount extends React.Component<Props, State> {
  state = {
  };

  render() {
    const {
      pristine,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      user,
      features,
      submitting,
      isSuperAdmin,
      handleSubmit,
      intl,
    } = this.props;
    const userRoles = [
      {
        id: 'ROLE_SUPER_ADMIN',
        label: intl.formatMessage({id: 'roles.super_admin'}),
      },
      {
        id: 'ROLE_ADMIN',
        label: intl.formatMessage({id: 'roles.admin'}),
      },
      {
        id: 'ROLE_USER',
        label: intl.formatMessage({id: 'roles.user'}),
      }
    ];
    return (
      <div className="box box-primary container-fluid">
        <form onSubmit={handleSubmit}>
          <div className="box-header">
            <h2 className="box-title">
              <FormattedMessage id="user.profile.edit.account" />
            </h2>
          </div>
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
              name="locked"
              component={component}
              type="checkbox"
              id="enabled"
              children={<FormattedMessage id="form.label_enabled" />}
            />
            <Field
              name="enabled"
              component={component}
              type="checkbox"
              id="locked"
              children={<FormattedMessage id="form.label_locked" />}
            />
            <Field
              name="expired"
              component={component}
              type="checkbox"
              disabled
              id="locked"
              children={<FormattedMessage id="form.label_expired" /> }
            />
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="form.label_real_roles" />
              </h3>
            </div>
            <Field
              id="user_roles"
              name="roles"
              component={component}
              isReduxForm
              type="checkbox"
              label={
                <FormattedMessage id="form.label_real_roles"/>
              }
              choices={userRoles}
            />
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="subscription" />
              </h3>
            </div>
            <Field
              id="newsletter"
              name="newsletter"
              component={component}
              isReduxForm
              type="checkbox"
              disabled
              children={<FormattedMessage id="newsletter" />}
            />
            <ButtonToolbar className="box-content__toolbar">
              <Button
                type="submit"
                id="user_admin_account_save"
                bsStyle="primary"
                disabled={pristine || invalid || submitting}>
                <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
              </Button>
              <AlertForm
                valid={valid}
                invalid={invalid}
                submitSucceeded={submitSucceeded}
                submitFailed={submitFailed}
                submitting={submitting}
              />
            </ButtonToolbar>
          </div>
        </form>
      </div>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(UserAdminAccount);

const mapStateToProps: MapStateToProps<*, *, *> = (
  state: GlobalState,
  { user }: RelayProps,
) => ({
  isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
  features: state.default.features,
  initialValues: {
    vip: user.vip,
    enabled: user.enabled,
    locked: user.locked,
    roles: user.roles,
    expired: user.expired,
    newsletter: user.isSubscribedToNewsLetter,
  },
});

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(
  container,
  graphql`
    fragment UserAdminAccount_user on User {
      id
      roles
      email
      locked
      vip
      enabled
      expired
      expiredAt
      isSubscribedToNewsLetter
      isSubscribedToNewsLetterAt
    }
  `,
);
