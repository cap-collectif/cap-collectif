// @flow
import React from 'react';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { Modal, Button } from 'react-bootstrap';
import { submit, reduxForm, Field, arrayPush, change, formValueSelector } from 'redux-form';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';
import { renderLabel } from '../Content/ProjectContentAdminForm';
import toggle from '~/components/Form/Toggle';
import renderComponent from '~/components/Form/Field';
import type { Dispatch, GlobalState } from '~/types';
import { ProjectBoxHeader, PermalinkWrapper } from '../Form/ProjectAdminForm.style';
import ProjectAdminQuestionnaireStepForm from './ProjectAdminQuestionnaireStepForm';
import ProjectAdminConsultationStepForm from './ProjectAdminConsultationStepForm';
import {
  FormContainer,
  DateContainer,
  CustomCodeArea,
  LabelField,
  LabelView,
  ViewsContainer,
} from './ProjectAdminStepForm.style';
import { createRequirements, type Requirement, formatRequirements } from './StepRequirementsList';
import ProjectAdminSynthesisStepForm from './ProjectAdminSynthesisStepForm';
import ProjectAdminSelectionStepForm from './ProjectAdminSelectionStepForm';
import { type ProposalStepStatus } from './StepStatusesList';
import type { ProjectAdminStepForm_project } from '~relay/ProjectAdminStepForm_project.graphql';
import ProjectAdminRankingStepForm from './ProjectAdminRankingStepForm';
import ProjectAdminCollectStepForm from './ProjectAdminCollectStepForm';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import IconListView from '~svg/list_view.svg';
import IconGridView from '~svg/grid_view.svg';
import IconMapView from '~svg/map_view.svg';
import type { ProposalViewMode } from '~/redux/modules/proposal';

type Props = {|
  ...ReduxFormFormProps,
  handleClose?: () => {},
  step: {
    id: string,
    label: string,
    title: string,
    type: string,
    startAt: string,
    endAt: ?string,
    body: string,
    isEnabled: boolean,
    timeless?: boolean,
    metaDescription: ?string,
    customCode: ?string,
    questionnaire?: {| value: string, label: string |},
    footer?: ?string,
    url: string,
    requirements?: ?Array<Requirement>,
    requirementsReason?: ?string,
    consultations?: Array<{| value: string, label: string |}>,
    statuses?: ?Array<ProposalStepStatus>,
    defaultSort?: ?string,
    proposalsHidden?: ?boolean,
    votable?: ?boolean,
    votesHelpText?: ?string,
    voteThreshold?: number,
    votesMin?: number,
    votesLimit?: number,
    votesRanking?: number,
    budget?: number,
    isBudgetEnabled?: ?boolean,
    isTresholdEnabled?: ?boolean,
    isLimitEnabled?: ?boolean,
    allowingProgressSteps?: ?boolean,
    nbVersionsToDisplay?: ?number,
    nbOpinionsToDisplay?: ?number,
    defaultStatus?: ?string,
    proposalForm?: {|
      value: string,
      label: string,
      isGridViewEnabled: boolean,
      isListViewEnabled: boolean,
      isMapViewEnabled: boolean,
    |},
    form?: {|
      isGridViewEnabled: boolean,
      isListViewEnabled: boolean,
      isMapViewEnabled: boolean,
    |},
    private?: ?boolean,
    mainView: string,
  },
  intl: IntlShape,
  formName: string,
  isCreating: boolean,
  index?: number,
  timeless: boolean,
  requirements?: ?Array<Requirement>,
  statuses?: ?Array<ProposalStepStatus>,
  votable?: boolean,
  isBudgetEnabled?: boolean,
  isTresholdEnabled?: boolean,
  isLimitEnabled?: boolean,
  isPrivate?: ?boolean,
  isGridViewEnabled: boolean,
  isListViewEnabled: boolean,
  isMapViewEnabled: boolean,
  project: ProjectAdminStepForm_project,
  mainView: ?ProposalViewMode,
|};

type DisplayMode = {
  isGridViewEnabled: boolean,
  isListViewEnabled: boolean,
  isMapViewEnabled: boolean,
};

export type FormValues = {|
  label: string,
  title: string,
  type: string,
  body: string,
  endAt: ?string,
  startAt: string,
  questionnaire?: string,
  consultations?: Array<string>,
  requirements?: Array<Requirement>,
  statuses?: Array<ProposalStepStatus>,
  defaultSort?: ?string,
  proposalsHidden?: boolean,
  votable?: ?boolean,
  votesHelpText?: ?string,
  voteThreshold?: number,
  votesLimit?: number,
  votesMin?: number,
  votesRanking?: number,
  budget?: number,
  isBudgetEnabled?: ?boolean,
  isTresholdEnabled?: ?boolean,
  isLimitEnabled?: ?boolean,
  allowingProgressSteps?: ?boolean,
  nbVersionsToDisplay?: ?number,
  nbOpinionsToDisplay?: ?number,
  defaultStatus?: ?string,
  proposalForm?: string,
  private?: ?boolean,
  mainView?: ProposalViewMode,
|};

const stepFormName = 'stepForm';

const getMainView = (
  isGridViewEnabled: ?boolean,
  isListViewEnabled: ?boolean,
  isMapViewEnabled: ?boolean,
) => {
  if (isGridViewEnabled) return 'grid';
  if (isListViewEnabled) return 'list';
  if (isMapViewEnabled) return 'map';
};

const getValueDisplayMode = (
  step: $PropertyType<Props, 'step'>,
  project: ProjectAdminStepForm_project,
  isCreating: boolean,
  proposalFormSelected,
) => {
  let displayModeEnabled = {};

  if (step.type === 'CollectStep' && !isCreating) {
    displayModeEnabled = {
      isGridViewEnabled: step.form?.isGridViewEnabled,
      isListViewEnabled: step.form?.isListViewEnabled,
      isMapViewEnabled: step.form?.isMapViewEnabled,
    };
  }

  if (step.type === 'CollectStep' && isCreating) {
    displayModeEnabled = {
      isGridViewEnabled: proposalFormSelected?.isGridViewEnabled,
      isListViewEnabled: proposalFormSelected?.isListViewEnabled,
      isMapViewEnabled: proposalFormSelected?.isMapViewEnabled,
    };
  }

  if (step.type === 'SelectionStep') {
    displayModeEnabled = {
      isGridViewEnabled: project.firstCollectStep?.form?.isGridViewEnabled,
      isListViewEnabled: project.firstCollectStep?.form?.isListViewEnabled,
      isMapViewEnabled: project.firstCollectStep?.form?.isMapViewEnabled,
    };
  }

  const mainView =
    step?.mainView ||
    getMainView(
      displayModeEnabled.isGridViewEnabled,
      displayModeEnabled.isListViewEnabled,
      displayModeEnabled.isMapViewEnabled,
    );

  return {
    ...((displayModeEnabled: any): DisplayMode),
    mainView,
  };
};

const onSubmit = (formValues: FormValues, dispatch: Dispatch, props: Props) => {
  const requirements = formValues.requirements ? formatRequirements(formValues.requirements) : [];
  if (props.step && props.index !== undefined && props.index >= 0) {
    dispatch(
      change(props.formName, `steps[${+props.index}]`, {
        id: props.step.id,
        url: props.step.url,
        ...formValues,
        requirements,
        proposalsHidden: formValues.proposalsHidden === 1,
      }),
    );
  } else {
    dispatch(
      arrayPush(props.formName, 'steps', {
        id: null,
        ...formValues,
        requirements,
        proposalsHidden: formValues.proposalsHidden === 1,
      }),
    );
  }

  if (props.handleClose) {
    props.handleClose();
  }
};

const validate = ({
  type,
  label,
  title,
  startAt,
  questionnaire,
  consultations,
  votesLimit,
  votesMin,
  proposalForm,
}: FormValues) => {
  const errors = {};

  if (!label || label.length < 2) {
    errors.label = 'global.required';
  }

  if (!title || title.length < 2) {
    errors.title = 'global.required';
  }

  if (!startAt) {
    errors.startAt = 'global.required';
  }

  if (type === 'QuestionnaireStep') {
    if (!questionnaire) errors.questionnaire = 'global.required';
  }

  if (type === 'CollectStep') {
    if (!proposalForm) errors.proposalForm = 'global.required';
  }

  if (type === 'ConsultationStep') {
    if (!consultations || !consultations.length) errors.consultations = 'global.required';
  }

  if (votesMin != null) {
    if (votesLimit != null && votesLimit < votesMin && votesLimit > 0) {
      errors.votesMin = 'maximum-vote-must-be-higher-than-minimum';
    }
    if (votesMin < 0) {
      errors.votesMin = 'minimum-vote-must-be-greater-than-or-equal';
    }
  }

  if (votesLimit != null && votesLimit < 0) {
    if (errors.votesMin) {
      errors.votesMin = 'maximum-vote-must-be-greater-than-or-equal';
    } else {
      errors.votesLimit = 'maximum-vote-must-be-greater-than-or-equal';
    }
  }
  return errors;
};

export const renderSubSection = (label: string) => (
  <ProjectBoxHeader>
    <h5>
      <FormattedMessage id={label} />
    </h5>
  </ProjectBoxHeader>
);

const renderDateContainer = (formName: string, intl: IntlShape) => (
  <DateContainer>
    <Field
      id="step-startAt"
      component={renderComponent}
      type="datetime"
      name="startAt"
      formName={formName}
      label={<FormattedMessage id="start" />}
      addonAfter={<i className="cap-calendar-2" />}
    />
    <Field
      id="step-endAt"
      component={renderComponent}
      type="datetime"
      name="endAt"
      formName={formName}
      label={renderLabel('end', intl)}
      addonAfter={<i className="cap-calendar-2" />}
    />
  </DateContainer>
);

export function ProjectAdminStepForm({
  step,
  handleSubmit,
  handleClose,
  form,
  intl,
  formName,
  timeless,
  submitting,
  dispatch,
  requirements,
  statuses,
  votable,
  isBudgetEnabled,
  isTresholdEnabled,
  isLimitEnabled,
  isPrivate,
  isGridViewEnabled,
  isListViewEnabled,
  isMapViewEnabled,
  mainView,
  isCreating,
}: Props) {
  const canSetDisplayMode =
    (step.type === 'SelectionStep' || step.type === 'CollectStep') &&
    (isGridViewEnabled || isListViewEnabled || isMapViewEnabled);

  React.useEffect(() => {
    // mainView is not in the reduxForm's initialValues because the proposalForm is selected after.
    // Normally, need to use enableReinitialize but it resets the form...
    if (mainView && isCreating && step.type === 'CollectStep') {
      dispatch(change(stepFormName, 'mainView', mainView));
    }
  }, [dispatch, isCreating, mainView, step.type]);

  return (
    <>
      <Modal.Body>
        <FormContainer onSubmit={handleSubmit} id={form}>
          {renderSubSection('global.general')}
          <Field
            type="text"
            name="label"
            id="step-label"
            label={<FormattedMessage id="color.main_menu.text" />}
            component={renderComponent}
          />
          <Field
            type="text"
            name="title"
            id="step-title"
            label={<FormattedMessage id="global.title" />}
            component={renderComponent}
          />
          {step.type !== 'PresentationStep' && (
            <>
              {(step.type === 'SelectionStep' ||
                step.type === 'CollectStep' ||
                step.type === 'QuestionnaireStep' ||
                step.type === 'ConsultationStep') && (
                <Field
                  icons
                  component={toggle}
                  name="timeless"
                  id="step-timeless"
                  normalize={val => !!val}
                  label={<FormattedMessage id="admin.fields.step.timeless" />}
                />
              )}
              {!timeless && renderDateContainer(formName, intl)}
            </>
          )}
          <Field
            type="editor"
            name="body"
            id="step-body"
            label={renderLabel('proposal.body', intl)}
            component={renderComponent}
          />
          <Field
            name="metaDescription"
            type="textarea"
            id="step-metaDescription"
            label={renderLabel('global.meta.description', intl, 'admin.help.metadescription')}
            component={renderComponent}
          />

          {step.type === 'QuestionnaireStep' && (
            <ProjectAdminQuestionnaireStepForm questionnaire={step.questionnaire} />
          )}
          {step.type === 'ConsultationStep' && (
            <ProjectAdminConsultationStepForm
              requirements={requirements}
              consultations={step.consultations}
            />
          )}
          {step.type === 'SynthesisStep' && <ProjectAdminSynthesisStepForm />}
          {step.type === 'SelectionStep' && (
            <ProjectAdminSelectionStepForm
              isBudgetEnabled={isBudgetEnabled}
              isTresholdEnabled={isTresholdEnabled}
              isLimitEnabled={isLimitEnabled}
              statuses={statuses}
              votable={votable}
              requirements={requirements}
            />
          )}
          {step.type === 'RankingStep' && <ProjectAdminRankingStepForm />}

          {step.type === 'CollectStep' && (
            <ProjectAdminCollectStepForm
              isPrivate={isPrivate}
              proposal={step.proposalForm}
              isBudgetEnabled={isBudgetEnabled}
              isTresholdEnabled={isTresholdEnabled}
              isLimitEnabled={isLimitEnabled}
              statuses={statuses}
              votable={votable}
              requirements={requirements}
            />
          )}

          {canSetDisplayMode && (
            <ViewsContainer>
              <LabelField>
                <FormattedMessage id="display.mode" tagName="h5" />
                <a
                  href="https://aide.cap-collectif.com/article/51-creer-un-formulaire-de-depot#affichage"
                  rel="noopener noreferrer"
                  target="_blank">
                  <Icon
                    name={ICON_NAME.information}
                    size={16}
                    color={colors.blue}
                    className="mr-5"
                  />
                  <FormattedMessage id="global.help" />
                </a>
              </LabelField>

              <span className="help-block">
                <FormattedMessage id="select.default.display.mode" />
              </span>

              <div>
                {isListViewEnabled && (
                  <Field
                    id="listView"
                    type="radio"
                    name="mainView"
                    value="list"
                    component={renderComponent}
                    label={
                      <LabelView>
                        <IconListView className="icon-illustration" />
                        <FormattedMessage id="list.view" />
                      </LabelView>
                    }
                  />
                )}

                {isGridViewEnabled && (
                  <Field
                    id="gridView"
                    type="radio"
                    name="mainView"
                    value="grid"
                    component={renderComponent}
                    label={
                      <LabelView>
                        <IconGridView className="icon-illustration" />
                        <FormattedMessage id="grid.view" />
                      </LabelView>
                    }
                  />
                )}

                {isMapViewEnabled && (
                  <Field
                    id="mapView"
                    type="radio"
                    name="mainView"
                    value="map"
                    component={renderComponent}
                    label={
                      <LabelView>
                        <IconMapView className="icon-illustration" />
                        <FormattedMessage id="map.view" />
                      </LabelView>
                    }
                  />
                )}
              </div>
            </ViewsContainer>
          )}

          {renderSubSection('global.publication')}
          <>
            <Field
              icons
              component={toggle}
              name="isEnabled"
              id="step-isEnabled"
              normalize={val => !!val}
              label={<FormattedMessage id="global.published" />}
            />{' '}
            {step.url && (
              <PermalinkWrapper>
                <strong>
                  <FormattedMessage id="permalink" /> :
                </strong>{' '}
                <a href={step?.url} target="blank">
                  {step?.url}
                </a>
              </PermalinkWrapper>
            )}
          </>
          {renderSubSection('global-customization')}
          <CustomCodeArea>
            <Field
              name="customCode"
              type="textarea"
              id="step-customCode"
              rows={4}
              label={renderLabel('admin.customcode', intl, 'admin.help.customcode')}
              placeholder='<script type="text/javascript"> </script>'
              component={renderComponent}
            />
          </CustomCodeArea>
        </FormContainer>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleClose}>
          <FormattedMessage id="global.cancel" />
        </Button>
        <Button
          id="step-modal-submit"
          disabled={submitting}
          onClick={() => {
            dispatch(submit(form));
          }}
          bsStyle="primary">
          {submitting ? (
            <FormattedMessage id="global.loading" />
          ) : (
            <FormattedMessage id="global.save" />
          )}
        </Button>
      </Modal.Footer>
    </>
  );
}

const mapStateToProps = (state: GlobalState, { step, isCreating, project }: Props) => {
  const { isGridViewEnabled, isListViewEnabled, isMapViewEnabled, mainView } = getValueDisplayMode(
    step,
    project,
    isCreating,
    formValueSelector(stepFormName)(state, 'proposalForm'),
  );
  return {
    initialValues: {
      // AbstractStep
      url: step?.url ? step.url : null,
      type: step?.type ? step.type : null,
      label: step?.label ? step.label : null,
      body: step?.body ? step.body : null,
      title: step?.title ? step.title : null,
      endAt: step?.endAt ? step.endAt : null,
      startAt: step?.startAt ? step.startAt : null,
      isEnabled: step?.isEnabled ? step.isEnabled : true,
      timeless: step?.timeless ? step.timeless : false,
      metaDescription: step?.metaDescription ? step.metaDescription : null,
      customCode: step?.customCode ? step.customCode : null,
      requirementsReason: step?.requirementsReason || null,
      isGridViewEnabled,
      isListViewEnabled,
      isMapViewEnabled,
      mainView,
      // QuestionnaireStep
      questionnaire: step?.questionnaire || null,
      footer: step?.footer ? step.footer : null,
      // ConsultationStep
      consultations: step?.consultations || [],
      requirements: step ? createRequirements(step) : [],
      // SelectionStep
      statuses: step?.statuses?.length ? step.statuses : [],
      defaultSort: step?.defaultSort?.toUpperCase() || 'RANDOM',
      proposalsHidden: step?.proposalsHidden ? 1 : 0,
      allowingProgressSteps: step?.allowingProgressSteps || false,
      // CollectStep
      defaultStatus: step?.defaultStatus || null,
      proposalForm: step?.proposalForm || null,
      // RankingStep
      nbVersionsToDisplay: step?.nbVersionsToDisplay || null,
      nbOpinionsToDisplay: step?.nbOpinionsToDisplay || null,
      // Votable Trait
      votable: step?.votable || false,
      votesHelpText: step?.votesHelpText || null,
      votesMin: step?.votesMin || null,
      votesLimit: step?.votesLimit || null,
      votesRanking: step?.votesRanking || false,
      voteThreshold: step?.voteThreshold || null,
      budget: step?.budget || null,
      isBudgetEnabled: step?.isBudgetEnabled || false,
      isLimitEnabled: step?.isLimitEnabled || false,
      isTresholdEnabled: step?.isTresholdEnabled || false,
      private: step?.private || false,
    },
    isBudgetEnabled: formValueSelector(stepFormName)(state, 'isBudgetEnabled') || false,
    isLimitEnabled: formValueSelector(stepFormName)(state, 'isLimitEnabled') || false,
    isTresholdEnabled: formValueSelector(stepFormName)(state, 'isTresholdEnabled') || false,
    isGridViewEnabled:
      step.type === 'CollectStep'
        ? formValueSelector(stepFormName)(state, 'proposalForm')?.isGridViewEnabled
        : formValueSelector(stepFormName)(state, 'isGridViewEnabled'),
    isListViewEnabled:
      step.type === 'CollectStep'
        ? formValueSelector(stepFormName)(state, 'proposalForm')?.isListViewEnabled
        : formValueSelector(stepFormName)(state, 'isListViewEnabled'),
    isMapViewEnabled:
      step.type === 'CollectStep'
        ? formValueSelector(stepFormName)(state, 'proposalForm')?.isMapViewEnabled
        : formValueSelector(stepFormName)(state, 'isMapViewEnabled'),
    mainView: formValueSelector(stepFormName)(state, 'mainView') || mainView,
    votable: formValueSelector(stepFormName)(state, 'votable') || false,
    timeless: formValueSelector(stepFormName)(state, 'timeless') || false,
    requirements: formValueSelector(stepFormName)(state, 'requirements') || [],
    statuses: formValueSelector(stepFormName)(state, 'statuses') || [],
    // "private" is a reserved word in js (will be)
    isPrivate: formValueSelector(stepFormName)(state, 'private') || false,
  };
};

const form = injectIntl(
  reduxForm({
    validate,
    onSubmit,
    form: stepFormName,
  })(ProjectAdminStepForm),
);

const ProjectAdminStepFormConnected = connect(mapStateToProps)(form);

export default createFragmentContainer(ProjectAdminStepFormConnected, {
  project: graphql`
    fragment ProjectAdminStepForm_project on Project {
      firstCollectStep {
        form {
          isGridViewEnabled
          isListViewEnabled
          isMapViewEnabled
        }
      }
    }
  `,
});
