// @flow
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button } from 'react-bootstrap';
import component from '../Form/Field';
import UpdateProposalFormNotificationsConfigurationMutation from '../../mutations/UpdateProposalFormNotificationsConfigurationMutation';
import type { ProposalFormAdminNotificationForm_proposalForm } from './__generated__/ProposalFormAdminNotificationForm_proposalForm.graphql';
import type { State } from '../../types';

type RelayProps = { proposalForm: ProposalFormAdminNotificationForm_proposalForm };
type Props = RelayProps & {
  handleSubmit: () => void,
  invalid: boolean,
  pristine: boolean,
  submitting: boolean,
};

const formName = 'proposal-form-admin-notification';
const validate = () => {
  return {};
};

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const { proposalForm } = props;
  const inputs = values;
  inputs.proposalFormId = proposalForm.id;
  return UpdateProposalFormNotificationsConfigurationMutation.commit({
    input: inputs,
  }).then(() => {
    location.reload();
  });
};

export class ProposalFormAdminNotificationForm extends Component<Props> {
  render() {
    const { invalid, pristine, handleSubmit, submitting } = this.props;
    return (
      <div className="box box-primary container">
        <div className="box-header">
          <h3
            className="box-title"
            style={{ fontSize: 22, padding: 0, paddingTop: 10, paddingBottom: 30 }}>
            Notification
          </h3>
          <a
            className="pull-right link"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/51-creer-un-formulaire-de-depot">
            <i className="fa fa-info-circle" /> Aide
          </a>
        </div>
        <form onSubmit={handleSubmit}>
          <h4 style={{ fontWeight: 'bold' }}>
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
          <ButtonToolbar style={{ marginBottom: 10 }}>
            <Button disabled={invalid || pristine || submitting} type="submit" bsStyle="primary">
              <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
            </Button>
            <Button bsStyle="danger" disabled>
              <FormattedMessage id="global.delete" />
            </Button>
          </ButtonToolbar>
        </form>
      </div>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  form: formName,
})(ProposalFormAdminNotificationForm);

const mapStateToProps = (state: State, props: RelayProps) => ({
  initialValues: props.proposalForm.notificationsConfiguration,
});

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(
  container,
  graphql`
    fragment ProposalFormAdminNotificationForm_proposalForm on ProposalForm {
      id
      notificationsConfiguration {
        onCreate
        onUpdate
        onDelete
      }
    }
  `,
);
