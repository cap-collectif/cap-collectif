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

type RelayProps = {
  +user: UserAdminAccount_user,
};
type Props = FormProps &
  RelayProps & {
    +themes: Array<{ id: Uuid, title: string }>,
    +features: FeatureToggles,
    +intl: IntlShape,
    +isSuperAdmin: boolean,
  };

const formName = 'user-admin-edit';

const onSubmit = (values: FormValues, dispatch: Dispatch, { user, isSuperAdmin }: Props) => {
  const input = {
    ...values,
    id: user.id,
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
    return (
      <div className="box box-primary container-fluid">
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
              label={<FormattedMessage id="form.label_vip" />}
            />
            <Field
              name="locked"
              component={component}
              type="checkbox"
              id="enabled"
              label={<FormattedMessage id="form.label_enabled" />}
            />
            <Field
              name="enabled"
              component={component}
              type="checkbox"
              id="locked"
              label={<FormattedMessage id="form.label_locked" />}
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
  },
});

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(
  container,
  graphql`
    fragment UserAdminAccount_user on User {
      id
      roles
      locked
      vip
      enabled
    }
  `,
);
