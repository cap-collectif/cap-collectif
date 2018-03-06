/**
 * @flow
 */
import React, { Component } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { Button, Table } from 'react-bootstrap';
import { reduxForm, Field } from 'redux-form';
import { connect, type MapStateToProps } from 'react-redux';
import component from '../../Form/Field';
import { AlertForm } from '../../Alert/AlertForm';
import ChangeUserNotificationsConfigurationMutation from '../../../mutations/ChangeUserNotificationsConfigurationMutation';
import type { NotificationsForm_viewer } from './__generated__/NotificationsForm_viewer.graphql';
import type { State } from '../../../types';

type RelayProps = {
  viewer: NotificationsForm_viewer
};
type FormValues = Object;
type Props = {
  viewer: Object,
  initialValues: Object,
  invalid: boolean,
  pristine: boolean,
  submitting: boolean,
  valid: boolean,
  submitSucceeded: boolean,
  submitFailed: boolean,
  handleSubmit: () => void
};

const formName = 'user-notifications';

const onSubmit = (values: FormValues) => {
  const variables = {
    input: { ...values }
  };
  return ChangeUserNotificationsConfigurationMutation.commit(variables);
};

export class NotificationsForm extends Component<Props> {
  render() {
    const {
      pristine,
      invalid,
      submitting,
      handleSubmit,
      valid,
      submitSucceeded,
      submitFailed
    } = this.props;
    return (
      <div>
        <p className="notifications-app-title">
          <FormattedMessage id="profile.account.notifications.app.collectstep" />
        </p>
        <form onSubmit={handleSubmit} className="form-horizontal">
          <Table className="notifications-table" striped>
            <thead>
              <tr>
                <th>
                  <FormattedMessage id="profile.account.notifications.informations" />
                </th>
                <th>
                  <FormattedMessage id="profile.account.notifications.email" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <FormattedMessage id="profile.account.notifications.proposal_comment" />
                </td>
                <td>
                  <Field
                    name="onProposalCommentMail"
                    component={component}
                    type="checkbox"
                    id="proposal-comment-mail"
                  />
                </td>
              </tr>
            </tbody>
          </Table>
          <div className="notifications-form-controls">
            <Button disabled={invalid || pristine || submitting} type="submit" bsStyle="primary">
              <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
            </Button>
            <AlertForm
              valid={valid}
              invalid={invalid}
              submitSucceeded={submitSucceeded}
              submitFailed={submitFailed}
              submitting={submitting}
            />
          </div>
        </form>
      </div>
    );
  }
}

const form = reduxForm({
  onSubmit,
  form: formName,
  enableReinitialize: true
})(NotificationsForm);

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: RelayProps) => {
  return {
    initialValues: props.viewer.notificationsConfiguration
  };
};

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(
  container,
  graphql`
    fragment NotificationsForm_viewer on User {
      notificationsConfiguration {
        onProposalCommentMail
      }
    }
  `
);
