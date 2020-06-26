// @flow
import React from 'react';
import { createFragmentContainer, graphql, QueryRenderer } from 'react-relay';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, useIntl, type IntlShape } from 'react-intl';
import moment from 'moment';
import { change, reset, Field, formValueSelector, reduxForm } from 'redux-form';
import { Button, ButtonToolbar, ToggleButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import type { Dispatch, State, Uuid } from '~/types';
import component from '../Form/Field';
import environment, { graphqlError } from '~/createRelayEnvironment';
import type { ProposalFormAdminAnalysisConfigurationForm_proposalForm } from '~relay/ProposalFormAdminAnalysisConfigurationForm_proposalForm.graphql';
import type { ProposalFormAdminAnalysisConfigurationFormQueryResponse } from '~relay/ProposalFormAdminAnalysisConfigurationFormQuery.graphql';
import select from '~/components/Form/Select';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import AlertForm from '~/components/Alert/AlertForm';
import { ProjectBoxHeader } from '~/components/Admin/Project/Form/ProjectAdminForm.style';
import Card from '~ui/Card/Card';
import UpdateProposalFormAnalysisConfigurationMutation from '~/mutations/UpdateProposalFormAnalysisConfigurationMutation';
import toggle from '~/components/Form/Toggle';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import { PROPOSAL_STATUS } from '~/constants/AnalyseConstants';
import colors from '~/utils/colors';
import ProposalFormAdminContainer, {
  Badge,
  MoveStepContainer,
  MoveStatusContainer,
  ButtonResetMoveStep,
  DateContainer,
  CustomDateContainer,
} from './ProposalFormAdminAnalysisConfigurationForm.style';

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
  effectiveDate: ?string,
  evaluationFormId: ?string,
  moveToSelectionStep: ?string,
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

const validate = (values: Object, props: Props) => {
  const errors = {};

  if (!values.unfavourableStatuses || values.unfavourableStatuses.length < 1) {
    errors.unfavourableStatuses = 'message.status.field.mandatory';
  }

  if (!values.analysisStep) {
    errors.analysisStep = 'message.analysis_step.field.mandatory';
  }

  if (props.effectiveDateEnabled && !values.effectiveDate) {
    errors.effectiveDate = 'message.date.field.mandatory';
  }

  return errors;
};

const onSubmit = (
  values: FormValues,
  dispatch: Dispatch,
  { proposalForm, effectiveDateEnabled }: Props,
) => {
  const input = {
    proposalFormId: proposalForm.id,
    analysisStepId: values.analysisStep,
    evaluationFormId: values.evaluationForm,
    effectiveDate: !effectiveDateEnabled
      ? null
      : moment(values.effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
    moveToSelectionStepId: values.moveToSelectionStep || null,
    selectionStepStatusId: values.moveToSelectionStatus || null,
    unfavourableStatuses: values.unfavourableStatuses?.map(status => status.value),
    favourableStatus: values.favourableStatus || null,
    costEstimationEnabled: values.costEstimationEnabled,
    body: values.body || '',
  };

  return UpdateProposalFormAnalysisConfigurationMutation.commit({ input });
};

export const ProposalFormAdminAnalysisConfigurationForm = ({
  proposalForm,
  selectedAnalysisStep,
  effectiveDateEnabled,
  evaluationFormId,
  moveToSelectionStep,
  effectiveDate,
  handleSubmit,
  pristine,
  dispatch,
  invalid,
  valid,
  submitSucceeded,
  submitFailed,
  submitting,
}: Props) => {
  const intl = useIntl();
  const statusesGroupedByStep = React.useMemo(() => getStatusesGroupedByStep(proposalForm), [
    proposalForm,
  ]);

  React.useEffect(() => {
    if (selectedAnalysisStep && !effectiveDate) {
      const dateEndStep =
        proposalForm.step?.project?.steps.find(step => step.id === selectedAnalysisStep)?.timeRange
          ?.endAt || null;
      dispatch(change(formName, 'effectiveDate', dateEndStep));
    }
  }, [selectedAnalysisStep, proposalForm.step, dispatch, effectiveDate]);

  const openQuestionnaire = (
    availableQuestionnaires: $PropertyType<
      ProposalFormAdminAnalysisConfigurationFormQueryResponse,
      'availableQuestionnaires',
    >,
  ) => {
    const questionnaire = availableQuestionnaires.find(q => q.id === evaluationFormId);

    window.open(questionnaire?.adminUrl, '_blank');
  };
  return (
    <ProposalFormAdminContainer onSubmit={handleSubmit(onSubmit)}>
      <div className="box box-primary container-fluid mt-10">
        <ProjectBoxHeader>
          <FormattedMessage id="analysis.phase" tagName="h4" />
        </ProjectBoxHeader>

        <div className="box-content">
          <Field
            clearable
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="true"
            options={proposalForm.step?.project?.steps
              .filter(
                step => step.__typename === 'CollectStep' || step.__typename === 'SelectionStep',
              )
              .map(step => ({
                value: step.id,
                label: step.title,
              }))}
            component={select}
            id="analysisStep"
            name="analysisStep"
            labelClassName="control-label"
            inputClassName="fake-inputClassName"
            placeholder={<FormattedMessage id="step.select" />}
          />
          <Field
            name="body"
            type="editor"
            id="body"
            component={component}
            label={
              <>
                <FormattedMessage id="global.description" />
                <span className="excerpt inline">
                  {intl.formatMessage({ id: 'global.optional' })}
                </span>

                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="tooltip-description" className="text-left">
                      {intl.formatMessage({ id: 'help.text.analysis.phase.intro' })}
                    </Tooltip>
                  }>
                  <Icon
                    name={ICON_NAME.information}
                    size={12}
                    color={colors.iconGrayColor}
                    className="ml-5"
                  />
                </OverlayTrigger>
              </>
            }
          />
        </div>
      </div>

      <div className="box box-primary container-fluid mt-10">
        <ProjectBoxHeader>
          <FormattedMessage id="global.questionnaire" tagName="h4" />
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
                  adminUrl
                }
              }
            `}
            render={({
              error,
              props,
            }: {
              ...ReactRelayReadyState,
              props: ?ProposalFormAdminAnalysisConfigurationFormQueryResponse,
            }) => {
              if (error) {
                console.error(error); // eslint-disable-line no-console
                return graphqlError;
              }

              if (props) {
                const { availableQuestionnaires } = props;
                return (
                  <Field
                    clearable
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
                    labelClassName="control-label"
                    inputClassName="fake-inputClassName"
                    placeholder={<FormattedMessage id="step-questionnaire" />}
                    buttonAfter={{
                      label: intl.formatMessage({ id: 'action_show' }),
                      onClick: () =>
                        evaluationFormId ? openQuestionnaire(availableQuestionnaires) : null,
                    }}
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
          <FormattedMessage id="decision.parameters" tag="h4" />
        </ProjectBoxHeader>
        <div className="box-content">
          <Card>
            <Card.Header>
              <Badge color={PROPOSAL_STATUS.UNFAVOURABLE.color}>
                <Icon name={PROPOSAL_STATUS.UNFAVOURABLE.icon} size={10} color="#fff" />
              </Badge>
              <span className="font-weight-bold">
                {intl.formatMessage({ id: 'unfavorable.decision' })}
              </span>
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
                    <FormattedMessage id="status.plural" />
                    <span className="excerpt inline">
                      {intl.formatMessage({ id: 'global.mandatory' })}
                    </span>

                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id="tooltip-status">
                          {intl.formatMessage({ id: 'help.reason.for.unfavorable.decision' })}
                        </Tooltip>
                      }>
                      <Icon
                        name={ICON_NAME.information}
                        size={12}
                        color={colors.iconGrayColor}
                        className="ml-5"
                      />
                    </OverlayTrigger>
                  </>
                }
              />
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <Badge color={PROPOSAL_STATUS.FAVOURABLE.color}>
                <Icon name={PROPOSAL_STATUS.FAVOURABLE.icon} size={10} color="#fff" />
              </Badge>
              <span className="font-weight-bold">
                {intl.formatMessage({ id: 'favorable.decision' })}
              </span>
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
                placeholder={<FormattedMessage id="status.select" />}
                label={<FormattedMessage id="global.status" />}
              />

              <MoveStepContainer>
                <Field
                  clearable={false}
                  searchable={false}
                  controlShouldRenderValue={false}
                  role="combobox"
                  aria-autocomplete="list"
                  aria-haspopup="true"
                  options={proposalForm.step?.project?.steps
                    .filter(step => step.__typename === 'SelectionStep')
                    .map(step => ({ value: step.id, label: step.title }))}
                  component={select}
                  id="moveToSelectionStep"
                  name="moveToSelectionStep"
                  inputClassName="select-move-step"
                  placeholder={
                    <FormattedMessage id={moveToSelectionStep ? 'edit.step' : 'choose.step'} />
                  }
                  label={<FormattedMessage id="move.proposition" />}
                />

                <MoveStatusContainer hasSelectedStep={!!moveToSelectionStep}>
                  {moveToSelectionStep ? (
                    <>
                      <Field
                        clearable={false}
                        searchable={false}
                        role="combobox"
                        aria-autocomplete="list"
                        aria-haspopup="true"
                        // $FlowFixMe
                        options={statusesGroupedByStep[moveToSelectionStep]}
                        component={select}
                        id="moveToSelectionStatus"
                        name="moveToSelectionStatus"
                        placeholder={<FormattedMessage id="global.no_status" />}
                        label={
                          proposalForm.step?.project?.steps.find(
                            step => step.id === moveToSelectionStep,
                          )?.title
                        }
                      />
                      <ButtonResetMoveStep
                        type="button"
                        onClick={() => {
                          dispatch(change(formName, 'moveToSelectionStep', null));
                          dispatch(change(formName, 'moveToSelectionStatus', null));
                        }}>
                        <Icon name={ICON_NAME.trash} size={16} color={colors.dangerColor} />
                      </ButtonResetMoveStep>
                    </>
                  ) : (
                    <FormattedMessage id="no-step" tagName="p" />
                  )}
                </MoveStatusContainer>
              </MoveStepContainer>
            </Card.Body>
          </Card>

          <DateContainer>
            <>
              <Field
                type="radio-buttons"
                id="effectiveDateEnabled"
                name="effectiveDateEnabled"
                label={<FormattedMessage id="global.updated.date" />}
                component={component}>
                <ToggleButton
                  id="step_now"
                  onClick={() => dispatch(change(formName, 'effectiveDateEnabled', false))}
                  value={false}>
                  <FormattedMessage id="global.immediate" />
                </ToggleButton>
                <ToggleButton
                  id="custom"
                  value={!!1}
                  onClick={() => dispatch(change(formName, 'effectiveDateEnabled', true))}>
                  <FormattedMessage id="global.custom.feminine" />
                </ToggleButton>
              </Field>
            </>

            {effectiveDateEnabled && (
              <CustomDateContainer>
                <Field
                  id="effectiveDate"
                  name="effectiveDate"
                  type="datetime"
                  component={component}
                  label={
                    <>
                      <FormattedMessage id="label.custom.date" />
                      <span className="excerpt ml-5">
                        {intl.formatMessage({ id: 'global.mandatory' })}
                      </span>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-date">
                            {intl.formatMessage({ id: 'help.date.by.default' })}
                          </Tooltip>
                        }>
                        <Icon
                          name={ICON_NAME.information}
                          size={12}
                          color={colors.iconGrayColor}
                          className="ml-5"
                        />
                      </OverlayTrigger>
                    </>
                  }
                  addonAfter={<i className="cap-calendar-2" />}
                />
              </CustomDateContainer>
            )}
          </DateContainer>
        </div>
      </div>

      <ButtonToolbar className="box-content__toolbar">
        <Button
          disabled={pristine || submitting}
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
    </ProposalFormAdminContainer>
  );
};

const form = reduxForm({
  enableReinitialize: true,
  form: formName,
  validate,
  onSubmit,
})(ProposalFormAdminAnalysisConfigurationForm);

const mapStateToProps = (state: State, props: RelayProps) => {
  const { proposalForm } = props;
  const { analysisConfiguration } = proposalForm;

  return {
    selectedAnalysisStep: formValueSelector(formName)(state, 'analysisStep'),
    effectiveDateEnabled: formValueSelector(formName)(state, 'effectiveDateEnabled'),
    evaluationFormId: formValueSelector(formName)(state, 'evaluationForm'),
    moveToSelectionStep: formValueSelector(formName)(state, 'moveToSelectionStep'),
    moveToSelectionStatus: formValueSelector(formName)(state, 'moveToSelectionStatus'),
    effectiveDate: formValueSelector(formName)(state, 'effectiveDate'),
    initialValues: {
      analysisStep: analysisConfiguration?.analysisStep?.id || null,
      evaluationForm: analysisConfiguration?.evaluationForm?.id || null,
      effectiveDateEnabled: !!analysisConfiguration?.effectiveDate,
      effectiveDate: analysisConfiguration?.effectiveDate || null,
      costEstimationEnabled: analysisConfiguration?.costEstimationEnabled || false,
      moveToSelectionStep: analysisConfiguration?.moveToSelectionStep?.id || null,
      moveToSelectionStatus: analysisConfiguration?.selectionStepStatus?.id || null,
      favourableStatus: analysisConfiguration?.favourableStatus?.id || null,
      unfavourableStatuses:
        analysisConfiguration?.unfavourableStatuses?.map(status => ({
          label: status.name,
          value: status.id,
        })) || null,
      body: analysisConfiguration?.body || null,
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
        }
        selectionStepStatus {
          id
        }
        analysisStep {
          id
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
