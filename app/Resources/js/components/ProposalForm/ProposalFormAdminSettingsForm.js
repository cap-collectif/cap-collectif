// @flow
import React, { Component } from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button } from 'react-bootstrap';
import component from '../Form/Field';
import AlertForm from '../Alert/AlertForm';
import ChangeProposalFormParametersMutation from '../../mutations/ChangeProposalFormParametersMutation';
import type { ProposalFormAdminSettingsForm_proposalForm } from './__generated__/ProposalFormAdminSettingsForm_proposalForm.graphql';
import type { State } from '../../types';

type RelayProps = {
  isSuperAdmin: boolean,
  // eslint-disable-next-line react/no-unused-prop-types
  proposalForm: ProposalFormAdminSettingsForm_proposalForm,
};
type Props = RelayProps & {
  intl: IntlShape,
  handleSubmit: () => void,
  invalid: boolean,
  pristine: boolean,
  submitting: boolean,
  valid: boolean,
  submitSucceeded: boolean,
  submitFailed: boolean,
};

const formName = 'proposal-form-admin-settings';
const validate = () => ({});

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
      intl,
      invalid,
      isSuperAdmin,
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
            <FormattedMessage id="proposal_form.admin.settings" />
          </h3>
          <a
            className="pull-right link"
            rel="noopener noreferrer"
            href={intl.formatMessage({ id: 'admin.help.link.form.settings' })}>
            <i className="fa fa-info-circle" /> <FormattedMessage id="global.help" />
          </a>
        </div>
        <div className="box-content">
          <form onSubmit={handleSubmit}>
            <h4>
              <FormattedMessage id="proposal_form.admin.settings.main" />
            </h4>
            <Field
              name="title"
              label={<FormattedMessage id="proposal_form.title" />}
              component={component}
              type="text"
              id="proposal_form_title"
            />
            <h4>
              <FormattedMessage id="proposal_form.admin.settings.options" />
            </h4>
            {isSuperAdmin && (
              <div>
                <h4>
                  <FormattedMessage id="proposal_form.admin.settings.commentable" />
                </h4>
                <Field
                  name="commentable"
                  children={<FormattedMessage id="proposal_form.commentable" />}
                  component={component}
                  type="checkbox"
                  id="proposal_form_commentable"
                />
              </div>
            )}
            <Field
              name="costable"
              children={<FormattedMessage id="proposal_form.admin.settings.costable" />}
              component={component}
              type="checkbox"
              id="proposal_form_costable"
            />
            <ButtonToolbar className="box-content__toolbar">
              <Button
                disabled={invalid || pristine || submitting}
                id="parameters-submit"
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
})(ProposalFormAdminSettingsForm);

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: RelayProps) => {
  const { proposalForm } = props;
  return {
    isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
    initialValues: {
      title: proposalForm.title,
      commentable: proposalForm.commentable,
      costable: proposalForm.costable,
    },
  };
};

const container = connect(mapStateToProps)(form);
const containerIntl = injectIntl(container);

export default createFragmentContainer(
  containerIntl,
  graphql`
    fragment ProposalFormAdminSettingsForm_proposalForm on ProposalForm {
      id
      title
      commentable
      costable
    }
  `,
);
