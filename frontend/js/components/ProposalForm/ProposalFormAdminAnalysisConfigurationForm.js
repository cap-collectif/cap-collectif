// @flow
import React from 'react';
import { createFragmentContainer, graphql, QueryRenderer } from 'react-relay';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { change, reset, Field, formValueSelector, reduxForm } from 'redux-form';
import { Button, ButtonToolbar, ToggleButton } from 'react-bootstrap';
import type { Dispatch, State, Uuid } from '~/types';
import component from '../Form/Field';
import environment, { graphqlError } from '../../createRelayEnvironment';
import type { ProposalFormAdminAnalysisConfigurationForm_proposalForm } from '~relay/ProposalFormAdminAnalysisConfigurationForm_proposalForm.graphql';
import select from '~/components/Form/Select';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import AlertForm from '~/components/Alert/AlertForm';
import { ProjectBoxHeader } from '~/components/Admin/Project/Form/ProjectAdminForm.style';
import Card from '~ui/Card/Card';
import UpdateProposalFormAnalysisConfigurationMutation from '~/mutations/UpdateProposalFormAnalysisConfigurationMutation';
import toggle from '~/components/Form/Toggle';
import type { ProposalFormAdminEvaluationFormQueryResponse } from '~relay/ProposalFormAdminEvaluationFormQuery.graphql';

type RelayProps = {|
  proposalForm: ProposalFormAdminAnalysisConfigurationForm_proposalForm,
|};
type Props = {|
  ...ReduxFormFormProps,
  ...RelayProps,
  selectedAnalysisStep?: Uuid,
  intl: IntlShape,
  dispatch: Dispatch,
  effectiveDateEnabled: boolean,
|};

type FormValues = Object;

export const formName = 'proposal-form-admin-analysis-configuration';

const getStatusesGroupedByStep = (
  proposalForm: ProposalFormAdminAnalysisConfigurationForm_proposalForm,
) =>
  proposalForm.step?.project?.steps
    .filter(step => step.__typename === 'CollectStep' || step.__typename === 'SelectionStep')
    .reduce((acc, step) => {
      // $FlowFixMe (later)
      acc[step.id] = step?.statuses?.map(status => ({ label: status.name, value: status.id }));
      return acc;
    }, {});

const onSubmit = (
  values: FormValues,
  dispatch: Dispatch,
  { proposalForm, effectiveDateEnabled }: Props,
) => {
  const input = {
    proposalFormId: proposalForm.id,
    analysisStepId: values.analysisStep,
    evaluationFormId: values.evaluationForm,
    effectiveDate: !effectiveDateEnabled ? null : values.effectiveDate,
    moveToSelectionStepId: values.moveToSelectionStep,
    unfavourableStatuses: values.unfavourableStatuses?.map(status => {
      return status.value;
    }),
    favourableStatus: values.favourableStatus,
    costEstimationEnabled: values.costEstimationEnabled,
    body: values.body,
  };

  return UpdateProposalFormAnalysisConfigurationMutation.commit({ input });
};

export const ProposalFormAdminAnalysisConfigurationForm = ({
  proposalForm,
  selectedAnalysisStep,
  effectiveDateEnabled,
  handleSubmit,
  pristine,
  dispatch,
  invalid,
  valid,
  submitSucceeded,
  submitFailed,
  submitting,
}: Props) => {
  const statusesGroupedByStep = React.useMemo(() => getStatusesGroupedByStep(proposalForm), [
    proposalForm,
  ]);
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="box box-primary container-fluid mt-10">
        <ProjectBoxHeader>
          <h4>
            <FormattedMessage id="analysis.phase" />
          </h4>
        </ProjectBoxHeader>
        <div className="box-content">
          <Field
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="true"
            options={proposalForm.step?.project?.steps
              .filter(step => {
                return step.__typename === 'CollectStep' || step.__typename === 'SelectionStep';
              })
              .map(step => {
                return { value: step.id, label: step.title };
              })}
            component={select}
            id="analysisStep"
            name="analysisStep"
            clearable
            labelClassName="control-label"
            inputClassName="fake-inputClassName"
            placeholder={<FormattedMessage id="step-selection" />}
          />
          <Field
            name="body"
            type="editor"
            id="body"
            component={component}
            label={<FormattedMessage id="admin.field.description.optional" />}
          />
        </div>
      </div>
      <div className="box box-primary container-fluid mt-10">
        <ProjectBoxHeader>
          <h4>
            <FormattedMessage id="global.questionnaire" />
          </h4>
        </ProjectBoxHeader>
        <div className="box-content">
          <QueryRenderer
            variables={{}}
            environment={environment}
            query={graphql`
              query ProposalFormAdminAnalysisConfigurationFormQuery {
                availableQuestionnaires {
                  id
                  title
                }
              }
            `}
            render={({
              error,
              props,
            }: {
              ...ReactRelayReadyState,
              props: ?ProposalFormAdminEvaluationFormQueryResponse,
            }) => {
              if (error) {
                console.log(error); // eslint-disable-line no-console
                return graphqlError;
              }
              if (props) {
                const { availableQuestionnaires } = props;
                return (
                  <Field
                    role="combobox"
                    aria-autocomplete="list"
                    aria-haspopup="true"
                    options={[
                      ...(proposalForm?.analysisConfiguration?.evaluationForm
                        ? [
                            {
                              value: proposalForm?.analysisConfiguration?.evaluationForm.id,
                              label: proposalForm?.analysisConfiguration?.evaluationForm.title,
                            },
                          ]
                        : []),
                      ...availableQuestionnaires
                        .filter(
                          form =>
                            form.id !== proposalForm?.analysisConfiguration?.evaluationForm?.id,
                        )
                        .map(form => {
                          return { value: form.id, label: form.title };
                        }),
                    ]}
                    component={select}
                    id="evaluationForm"
                    name="evaluationForm"
                    clearable
                    labelClassName="control-label"
                    inputClassName="fake-inputClassName"
                    placeholder={<FormattedMessage id="proposal_form.select_evaluation_form" />}
                  />
                );
              }
              return <Loader />;
            }}
          />

          <Field
            component={toggle}
            id="costEstimationEnabled"
            name="costEstimationEnabled"
            normalize={val => !!val}
            label={<FormattedMessage id="proposal.estimation" />}
          />
        </div>
      </div>
      <div className="box box-primary container-fluid mt-10">
        <ProjectBoxHeader>
          <h4>
            <FormattedMessage id="decision.parameters" />
          </h4>
        </ProjectBoxHeader>
        <div className="box-content">
          <Card>
            <Card.Header>
              <FormattedMessage id="unfavorable.decision" />
            </Card.Header>
            <Card.Body>
              <Field
                role="combobox"
                aria-autocomplete="list"
                aria-haspopup="true"
                // $FlowFixMe
                options={statusesGroupedByStep[selectedAnalysisStep]}
                component={select}
                id="unfavourableStatuses"
                name="unfavourableStatuses"
                clearable
                multi
                labelClassName="control-label"
                inputClassName="fake-inputClassName"
                placeholder={<FormattedMessage id="status.select.plural" />}
                label={
                  <>
                    <FormattedMessage id="global.status" />
                  </>
                }
              />
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <FormattedMessage id="favorable.decision" />
            </Card.Header>
            <Card.Body>
              <Field
                role="combobox"
                aria-autocomplete="list"
                aria-haspopup="true"
                // $FlowFixMe
                options={statusesGroupedByStep[selectedAnalysisStep]}
                component={select}
                id="favourableStatus"
                name="favourableStatus"
                clearable
                labelClassName="control-label"
                inputClassName="fake-inputClassName"
                placeholder={<FormattedMessage id="user.profile.edit.no_user_type" />}
                label={<FormattedMessage id="global.status" />}
              />

              <Field
                role="combobox"
                aria-autocomplete="list"
                aria-haspopup="true"
                options={proposalForm.step?.project?.steps
                  .filter(step => {
                    return step.__typename === 'SelectionStep';
                  })
                  .map(step => {
                    return { value: step.id, label: step.title };
                  })}
                component={select}
                id="moveToSelectionStep"
                name="moveToSelectionStep"
                clearable
                labelClassName="control-label"
                inputClassName="fake-inputClassName"
                placeholder={<FormattedMessage id="choose.step" />}
                label={<FormattedMessage id="move.proposition" />}
              />
            </Card.Body>
          </Card>

          <Field
            type="radio-buttons"
            id="effectiveDateEnabled"
            name="effectiveDateEnabled"
            label={<FormattedMessage id="global.updated.date" />}
            component={component}>
            <ToggleButton
              id="step_now"
              onClick={() => dispatch(change(formName, 'effectiveDateEnabled', 0))}
              value={0}>
              <FormattedMessage id="global.immediate" />
            </ToggleButton>
            <ToggleButton
              id="custom"
              value={1}
              onClick={() => dispatch(change(formName, 'effectiveDateEnabled', 1))}>
              <FormattedMessage id="global.custom.feminine" />
            </ToggleButton>
          </Field>
          {effectiveDateEnabled && (
            <Field id="effectiveDate" name="effectiveDate" type="datetime" component={component} />
          )}
        </div>
      </div>

      <ButtonToolbar className="box-content__toolbar">
        <Button
          disabled={invalid || pristine || submitting}
          id="analysis-configuration-submit"
          type="submit"
          bsStyle="primary">
          <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
        </Button>
        <Button bsStyle="danger" onClick={() => dispatch(reset(formName))}>
          <FormattedMessage id="global.reset" />
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
  );
};

const form = reduxForm({
  enableReinitialize: true,
  form: formName,
  onSubmit,
})(ProposalFormAdminAnalysisConfigurationForm);

const mapStateToProps = (state: State, props: RelayProps) => {
  return {
    selectedAnalysisStep: formValueSelector(formName)(state, 'analysisStep'),
    effectiveDateEnabled: formValueSelector(formName)(state, 'effectiveDateEnabled'),
    initialValues: {
      effectiveDateEnabled: props.proposalForm.analysisConfiguration?.effectiveDate ? 1 : 0,
      analysisStep: props.proposalForm.analysisConfiguration?.analysisStep?.id || null,
      evaluationForm: props.proposalForm.analysisConfiguration?.evaluationForm?.id || null,
      effectiveDate: props.proposalForm.analysisConfiguration?.effectiveDate || null,
      costEstimationEnabled: props.proposalForm.analysisConfiguration?.costEstimationEnabled,
      moveToSelectionStep:
        props.proposalForm.analysisConfiguration?.moveToSelectionStep?.id || null,
      favourableStatus: props.proposalForm.analysisConfiguration?.favourableStatus?.id || null,
      unfavourableStatuses:
        props.proposalForm.analysisConfiguration?.unfavourableStatuses?.map(status => ({
          label: status.name,
          value: status.id,
        })) || null,
      body: props.proposalForm.analysisConfiguration?.body || null,
    },
  };
};

const container = connect(mapStateToProps)(form);
const intlContainer = injectIntl(container);

export default createFragmentContainer(intlContainer, {
  proposalForm: graphql`
    fragment ProposalFormAdminAnalysisConfigurationForm_proposalForm on ProposalForm {
      id
      analysisConfiguration {
        __typename
        id
        body
        effectiveDate
        costEstimationEnabled
        moveToSelectionStep {
          id
          title
        }
        analysisStep {
          id
          title
        }
        evaluationForm {
          id
          title
          __typename
        }
        favourableStatus {
          id
          name
        }
        unfavourableStatuses {
          id
          name
        }
      }
      step {
        project {
          steps {
            ... on ProposalStep {
              id
              title
              timeRange {
                endAt
              }
              statuses {
                id
                name
              }
            }
            __typename
          }
        }
      }
    }
  `,
});
