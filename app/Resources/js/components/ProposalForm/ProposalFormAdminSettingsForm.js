// @flow
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button } from 'react-bootstrap';
import component from '../Form/Field';
import AlertAdminForm from '../Alert/AlertAdminForm';
import ChangeProposalFormParametersMutation from '../../mutations/ChangeProposalFormParametersMutation';
import type { ProposalFormAdminSettingsForm_proposalForm } from './__generated__/ProposalFormAdminSettingsForm_proposalForm.graphql';
import type { State } from '../../types';

type RelayProps = { proposalForm: ProposalFormAdminSettingsForm_proposalForm };
type Props = RelayProps & {
  handleSubmit: () => void,
  invalid: boolean,
  pristine: boolean,
  submitting: boolean,
  valid: boolean,
  submitSucceeded: boolean,
  submitFailed: boolean,
};

const formName = 'proposal-form-admin-settings';
const validate = () => {
  return {};
};

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const { proposalForm } = props;
  values.proposalFormId = proposalForm.id;
  delete values.id;
  return ChangeProposalFormParametersMutation.commit({
    input: values,
  });
};

export class ProposalFormAdminSettingsForm extends Component<Props> {
  render() {
    const {
      invalid,
      pristine,
      handleSubmit,
      submitting,
      valid,
      submitSucceeded,
      submitFailed,
    } = this.props;

    return (
      <div className="box box-primary container">
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="proposal_form.admin.settings" />
          </h3>
          <a
            className="pull-right link"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/51-creer-un-formulaire-de-depot">
            <i className="fa fa-info-circle" /> <FormattedMessage id="global.help" />
          </a>
        </div>
        <div className="box-content">
          <form onSubmit={handleSubmit}>
            <Field
              name="title"
              label={<FormattedMessage id="proposal_form.title" />}
              component={component}
              type="text"
              id="proposal_form_title"
            />
            <Field
              name="commentable"
              children={<FormattedMessage id="proposal_form.commentable" />}
              component={component}
              type="checkbox"
              id="proposal_form_commentable"
            />
            <ButtonToolbar className="box-content__toolbar">
              <Button disabled={invalid || pristine || submitting} type="submit" bsStyle="primary">
                <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
              </Button>
              <Button bsStyle="danger" disabled>
                <FormattedMessage id="global.delete" />
              </Button>
              <AlertAdminForm
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
})(ProposalFormAdminSettingsForm);

const mapStateToProps = (state: State, props: RelayProps) => {
  const { proposalForm } = props;
  return {
    initialValues: {
      title: proposalForm.title,
      commentable: proposalForm.commentable,
    },
  };
};

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(
  container,
  graphql`
    fragment ProposalFormAdminSettingsForm_proposalForm on ProposalForm {
      id
      title
      commentable
    }
  `,
);
