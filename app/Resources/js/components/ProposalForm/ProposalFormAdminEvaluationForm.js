// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { createFragmentContainer, graphql, QueryRenderer } from 'react-relay';
import { ButtonToolbar, Button } from 'react-bootstrap';
import environment, { graphqlError } from '../../createRelayEnvironment';
import type { Dispatch, State } from '../../types';
import component from '../Form/Field';
import AlertForm from '../Alert/AlertForm';
import type { ProposalFormAdminEvaluationForm_proposalForm } from './__generated__/ProposalFormAdminEvaluationForm_proposalForm.graphql';
import SetEvaluationFormInProposalFormMutation from '../../mutations/SetEvaluationFormInProposalFormMutation';
import Loader from '../Utils/Loader';

type RelayProps = { proposalForm: ProposalFormAdminEvaluationForm_proposalForm };
type Props = RelayProps & {
  handleSubmit: () => void,
  invalid: boolean,
  pristine: boolean,
  submitting: boolean,
  valid: boolean,
  submitSucceeded: boolean,
  submitFailed: boolean,
};

type DefaultProps = void;
type FormValues = Object;

export const formName = 'proposal-form-admin-evaluation';

const onSubmit = (values: FormValues, dispatch: Dispatch, { proposalForm }: Props) => {
  const evaluationFormId = values.evaluationForm;
  const proposalFormId = proposalForm.id;

  const input = {
    proposalFormId,
    evaluationFormId,
  };

  return SetEvaluationFormInProposalFormMutation.commit({ input });
};

export class ProposalFormAdminEvaluationForm extends React.Component<Props> {
  static defaultProps: DefaultProps;

  render() {
    const {
      proposalForm,
      handleSubmit,
      pristine,
      submitting,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
    } = this.props;

    return (
      <div className="box box-primary container">
        <div className="box-header">
          <h3
            className="box-title"
            style={{ fontSize: 22, padding: 0, paddingTop: 10, paddingBottom: 30 }}>
            <FormattedMessage id="proposal_form.evaluation" />
          </h3>
          <a
            className="pull-right link"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/51-creer-un-formulaire-de-depot">
            <i className="fa fa-info-circle" /> Aide
          </a>
        </div>
        <form onSubmit={handleSubmit}>
          <QueryRenderer
            environment={environment}
            query={graphql`
              query ProposalFormAdminEvaluationForm_availableQuestionnairesQuery {
                availableQuestionnaires {
                  id
                  title
                }
              }
            `}
            render={({ error, props }: { error: ?Error, props: any }) => {
              if (error) {
                console.log(error); // eslint-disable-line no-console
                return graphqlError;
              }
              if (props) {
                const { availableQuestionnaires } = props;

                return (
                  <Field
                    name="evaluationForm"
                    component={component}
                    type="select"
                    id="evaluation-form"
                    label={<FormattedMessage id="proposal_form.evaluation_form" />}>
                    <FormattedMessage id="proposal_form.select_evaluation_form">
                      {message => <option value="">{message}</option>}
                    </FormattedMessage>

                    {proposalForm.evaluationForm && (
                      <option
                        key={proposalForm.evaluationForm.id}
                        value={proposalForm.evaluationForm.id}>
                        {proposalForm.evaluationForm.title}
                      </option>
                    )}
                    {availableQuestionnaires &&
                      availableQuestionnaires.map(evaluationForm => (
                        <option key={evaluationForm.id} value={evaluationForm.id}>
                          {evaluationForm.title}
                        </option>
                      ))}
                  </Field>
                );
              }

              return <Loader />;
            }}
          />
          <ButtonToolbar style={{ marginBottom: 10 }}>
            <Button disabled={invalid || pristine || submitting} type="submit" bsStyle="primary">
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
    );
  }
}

const form = reduxForm({
  onSubmit,
  enableReinitialize: true,
  form: formName,
})(ProposalFormAdminEvaluationForm);

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: RelayProps) => ({
  initialValues: {
    evaluationForm: props.proposalForm.evaluationForm ? props.proposalForm.evaluationForm.id : null,
  },
});

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(
  container,
  graphql`
    fragment ProposalFormAdminEvaluationForm_proposalForm on ProposalForm {
      id
      evaluationForm {
        id
        title
      }
    }
  `,
);
