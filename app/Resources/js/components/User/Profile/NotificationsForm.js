/**
 * @flow
 */
import React, { Component } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { Button, Table, Panel } from 'react-bootstrap';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import component from '../../Form/Field';
import { AlertForm } from '../../Alert/AlertForm';
import ChangeUserNotificationsConfigurationMutation from '../../../mutations/ChangeUserNotificationsConfigurationMutation';
import type { NotificationsForm_viewer } from './__generated__/NotificationsForm_viewer.graphql';
import type { State } from '../../../types';

type RelayProps = {|
  // eslint-disable-next-line react/no-unused-prop-types
  viewer: NotificationsForm_viewer,
|};
type FormValues = Object;
type Props = {
  ...RelayProps,
  invalid: boolean,
  pristine: boolean,
  submitting: boolean,
  valid: boolean,
  submitSucceeded: boolean,
  submitFailed: boolean,
  handleSubmit: () => void,
};

const formName = 'user-notifications';

const onSubmit = (values: FormValues) => {
  const variables = {
    input: { ...values },
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
      submitFailed,
    } = this.props;

    const header = (
      <div className="panel-heading profile-header">
        <h1>
          <FormattedMessage id="profile.account.notifications.title" />
        </h1>
      </div>
    );

    const footer = (
      <div className="col-sm-offset-4">
        <Button disabled={invalid || pristine || submitting} type="submit" bsStyle="primary">
          <FormattedMessage id={submitting ? 'global.loading' : 'global.save_modifications'} />
        </Button>
      </div>
    );

    return (
      <form onSubmit={handleSubmit} className="form-horizontal">
        <Panel id="capco_horizontal_form">
          <Panel.Heading>{header}</Panel.Heading>
          <Panel.Body>
            <h2 className="page-header">
              <FormattedMessage id="profile.account.notifications.title" />
            </h2>
            <p className="notifications-app-title">
              <FormattedMessage id="profile.account.notifications.app.collectstep" />
            </p>
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
            <div className="divider" />
            <div className="notifications-form-controls">
              <AlertForm
                valid={valid}
                invalid={invalid}
                submitSucceeded={submitSucceeded}
                submitFailed={submitFailed}
                submitting={submitting}
              />
            </div>
          </Panel.Body>
          <Panel.Footer>{footer}</Panel.Footer>
        </Panel>
      </form>
    );
  }
}

const form = reduxForm({
  onSubmit,
  form: formName,
  enableReinitialize: true,
})(NotificationsForm);

const mapStateToProps = (state: State, props: RelayProps) => ({
  initialValues: props.viewer.notificationsConfiguration,
});

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(
  container,
  graphql`
    fragment NotificationsForm_viewer on User {
      notificationsConfiguration {
        onProposalCommentMail
      }
    }
  `,
);
