// @flow
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button } from 'react-bootstrap';
import component from '../Form/Field';
import ChangeTitleProposalFormMutation from '../../mutations/ChangeTitleProposalFormMutation';
import type { ProposalFormAdminSettingsForm_proposalForm } from './__generated__/ProposalFormAdminSettingsForm_proposalForm.graphql';
import type { State } from '../../types';

type RelayProps = { proposalForm: ProposalFormAdminSettingsForm_proposalForm };
type Props = RelayProps & {
  handleSubmit: () => void,
  invalid: boolean,
  pristine: boolean,
  submitting: boolean,
};

const formName = 'proposal-form-admin-settings';
const validate = () => {
  return {};
};

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const { proposalForm } = props;
  values.proposalFormId = proposalForm.id;
  delete values.id;
  return ChangeTitleProposalFormMutation.commit({
    input: values,
  }).then(() => {
    location.reload();
  });
};

export class ProposalFormAdminSettingsForm extends Component<Props> {
  render() {
    const { invalid, pristine, handleSubmit, submitting } = this.props;
    return (
      <div className="box box-primary container">
        <div className="box-header">
          <h3
            className="box-title"
            style={{ fontSize: 22, padding: 0, paddingTop: 10, paddingBottom: 30 }}>
            Paramètres
          </h3>
          <a
            className="pull-right link"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/51-creer-un-formulaire-de-depot">
            <i className="fa fa-info-circle" /> Aide
          </a>
        </div>
        <form onSubmit={handleSubmit}>
          <Field
            name="title"
            label={<FormattedMessage id="proposal_form.title" />}
            component={component}
            type="text"
            id="proposal_form_title"
          />
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
})(ProposalFormAdminSettingsForm);

const mapStateToProps = (state: State, props: RelayProps) => {
  const { proposalForm } = props;
  return {
    initialValues: { title: proposalForm.title },
  };
};

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(
  container,
  graphql`
    fragment ProposalFormAdminSettingsForm_proposalForm on ProposalForm {
      id
      title
    }
  `,
);
