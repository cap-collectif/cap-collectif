// @flow
import React, { Component } from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button } from 'react-bootstrap';
import component from '../Form/Field';
import AlertForm from '../Alert/AlertForm';
import UpdateProposalFormNotificationsConfigurationMutation from '../../mutations/UpdateProposalFormNotificationsConfigurationMutation';
import type { ProposalFormAdminNotificationForm_proposalForm } from '~relay/ProposalFormAdminNotificationForm_proposalForm.graphql';
import type { State } from '../../types';

type RelayProps = {|
  // eslint-disable-next-line react/no-unused-prop-types
  proposalForm: ProposalFormAdminNotificationForm_proposalForm,
|};
type Props = {|
  ...RelayProps,
  intl: IntlShape,
  handleSubmit: () => void,
  invalid: boolean,
  pristine: boolean,
  submitting: boolean,
  valid: boolean,
  submitSucceeded: boolean,
  submitFailed: boolean,
|};

const formName = 'proposal-form-admin-notification';
const validate = () => ({});

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const { proposalForm } = props;
  const inputs = values;
  inputs.proposalFormId = proposalForm.id;
  return UpdateProposalFormNotificationsConfigurationMutation.commit({
    input: inputs,
  });
};

export class ProposalFormAdminNotificationForm extends Component<Props> {
  render() {
    const {
      intl,
      invalid,
      pristine,
      handleSubmit,
      submitting,
      valid,
      submitSucceeded,
      submitFailed,
    } = this.props;
    return (
      <div className="box box-primary container-fluid">
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="proposal_form.admin.notification" />
          </h3>
          <a
            className="pull-right link"
            rel="noopener noreferrer"
            href={intl.formatMessage({ id: 'admin.help.link.form.notifications' })}>
            <i className="fa fa-info-circle" /> <FormattedMessage id="global.help" />
          </a>
        </div>
        <div className="box-content">
          <form onSubmit={handleSubmit}>
            <h4 style={{ fontWeight: 'bold', marginTop: 0 }}>
              <FormattedMessage id="proposal_form.notifications.label" />
            </h4>
            <Field
              name="onCreate"
              component={component}
              type="checkbox"
              id="proposal_form_notification_on_create">
              <FormattedMessage id="proposal_form.notifications.on_create" />
            </Field>
            <Field
              name="onUpdate"
              component={component}
              type="checkbox"
              id="proposal_form_notification_on_update">
              <FormattedMessage id="proposal_form.notifications.on_update" />
            </Field>
            <Field
              name="onDelete"
              component={component}
              type="checkbox"
              id="proposal_form_notification_on_delete">
              <FormattedMessage id="proposal_form.notifications.on_delete" />
            </Field>
            <h4 style={{ fontWeight: 'bold' }}>
              <FormattedMessage id="proposal_form.notifications_comment.label" />
            </h4>
            <Field
              name="onCommentCreate"
              component={component}
              type="checkbox"
              id="proposal_form_notification_comment_on_create">
              <FormattedMessage id="proposal_form.notifications_comment.on_create" />
            </Field>
            <Field
              name="onCommentUpdate"
              component={component}
              type="checkbox"
              id="proposal_form_notification_comment_on_update">
              <FormattedMessage id="proposal_form.notifications_comment.on_update" />
            </Field>
            <Field
              name="onCommentDelete"
              component={component}
              type="checkbox"
              id="proposal_form_notification_comment_on_delete">
              <FormattedMessage id="proposal_form.notifications_comment.on_delete" />
            </Field>
            <ButtonToolbar className="box-content__toolbar">
              <Button
                disabled={invalid || pristine || submitting}
                id="notification-submit"
                type="submit"
                bsStyle="primary">
                <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
              </Button>
              <Button bsStyle="danger" disabled>
                <FormattedMessage id="global.delete" />
              </Button>
              <AlertForm
                valid={valid}
                invalid={invalid}
                submitSucceeded={submitSucceeded}
                submitFailed={submitFailed}
                submitting={submitting}
              />
            </ButtonToolbar>
          </form>
        </div>
      </div>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(ProposalFormAdminNotificationForm);

const mapStateToProps = (state: State, props: RelayProps) => ({
  initialValues: props.proposalForm.notificationsConfiguration,
});

const container = connect(mapStateToProps)(form);
const intlContainer = injectIntl(container);

export default createFragmentContainer(intlContainer, {
  proposalForm: graphql`
    fragment ProposalFormAdminNotificationForm_proposalForm on ProposalForm {
      id
      notificationsConfiguration {
        onCreate
        onUpdate
        onDelete
        onCommentCreate
        onCommentUpdate
        onCommentDelete
      }
    }
  `,
});
