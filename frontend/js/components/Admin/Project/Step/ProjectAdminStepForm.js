// @flow
import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button, Modal } from 'react-bootstrap';
import { arrayPush, change, Field, formValueSelector, reduxForm, submit } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import styled from 'styled-components';
import { renderLabel } from '../Content/ProjectContentAdminForm';
import toggle from '~/components/Form/Toggle';
import renderComponent from '~/components/Form/Field';
import type { Dispatch, FeatureToggles, GlobalState } from '~/types';
import { PermalinkWrapper } from '../Form/ProjectAdminForm.style';
import ProjectAdminQuestionnaireStepForm from './ProjectAdminQuestionnaireStepForm';
import ProjectAdminConsultationStepForm from './ProjectAdminConsultationStepForm';
import {
  CustomCodeArea,
  DateContainer,
  FormContainer,
  LabelField,
  LabelView,
  ViewsContainer,
} from './ProjectAdminStepForm.style';
import { createRequirements, formatRequirements, type Requirement } from './StepRequirementsList';
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
import type { Articles } from '~/components/Admin/Project/Step/StepArticle/StepArticle';
import StepArticle from '~/components/Admin/Project/Step/StepArticle/StepArticle';
import { renderSubSection } from './ProjectAdminStepForm.utils';
import type { DebateType } from '~relay/DebateStepPageLogic_query.graphql';
import Accordion from '~ds/Accordion';
import Heading from '~ui/Primitives/Heading';
import DebateWidgetForm from '~/components/Admin/Project/Step/DebateWidgetForm/DebateWidgetForm';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';
import Text from '~ui/Primitives/Text';
import AppBox from '~/components/Ui/Primitives/AppBox';

type Props = {|
  ...ReduxFormFormProps,
  handleClose?: () => {},
  features: FeatureToggles,
  step: {
    id: string,
    label: string,
    title: string,
    __typename: string,
    startAt: string,
    endAt: ?string,
    body: string,
    isEnabled: boolean,
    timeless?: boolean,
    isAnonymousParticipationAllowed?: boolean,
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
    votable?: ?boolean,
    votesHelpText?: ?string,
    voteThreshold?: number,
    votesMin?: number,
    votesLimit?: number,
    votesRanking?: boolean,
    budget?: number,
    isBudgetEnabled?: ?boolean,
    isTresholdEnabled?: ?boolean,
    isLimitEnabled?: ?boolean,
    allowingProgressSteps?: ?boolean,
    allowAuthorsToAddNews?: ?boolean,
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
    articles?: Array<{
      id: string,
      url: string,
    }>,
    debate?: {
      id: string,
    },
    debateType?: DebateType,
    debateContent?: string,
    collectParticipantsEmail?: boolean,
  },
  intl: IntlShape,
  formName: string,
  isCreating: boolean,
  index?: number,
  timeless: boolean,
  isAnonymousParticipationAllowed: boolean,
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
  debateType?: DebateType,
|};

type DisplayMode = {
  isGridViewEnabled: boolean,
  isListViewEnabled: boolean,
  isMapViewEnabled: boolean,
};

type DebateStepForm = {|
  isAnonymousParticipationAllowed?: boolean,
  articles?: ?Articles,
|};

export type FormValues = {|
  label: string,
  title: string,
  __typename: string,
  body: string,
  endAt: ?string,
  startAt: string,
  questionnaire?: string,
  consultations?: Array<string>,
  requirements?: Array<Requirement>,
  statuses?: Array<ProposalStepStatus>,
  defaultSort?: ?string,
  votable?: ?boolean,
  votesHelpText?: ?string,
  voteThreshold?: number,
  votesLimit?: number,
  votesMin?: number,
  votesRanking?: boolean,
  budget?: number,
  isBudgetEnabled?: ?boolean,
  isTresholdEnabled?: ?boolean,
  isLimitEnabled?: ?boolean,
  allowingProgressSteps?: ?boolean,
  allowAuthorsToAddNews?: ?boolean,
  nbVersionsToDisplay?: ?number,
  nbOpinionsToDisplay?: ?number,
  defaultStatus?: ?string,
  proposalForm?: string,
  private?: ?boolean,
  mainView?: ProposalViewMode,
  ...DebateStepForm,
|};

export const stepFormName = 'stepForm';

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

  if (step.__typename === 'CollectStep' && !isCreating) {
    displayModeEnabled = {
      isGridViewEnabled: step.form?.isGridViewEnabled,
      isListViewEnabled: step.form?.isListViewEnabled,
      isMapViewEnabled: step.form?.isMapViewEnabled,
    };
  }

  if (step.__typename === 'CollectStep' && isCreating) {
    displayModeEnabled = {
      isGridViewEnabled: proposalFormSelected?.isGridViewEnabled,
      isListViewEnabled: proposalFormSelected?.isListViewEnabled,
      isMapViewEnabled: proposalFormSelected?.isMapViewEnabled,
    };
  }

  if (step.__typename === 'SelectionStep') {
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
        votesLimit: formValues.isLimitEnabled ? formValues.votesLimit : null,
        votesMin: formValues.isLimitEnabled ? formValues.votesMin : null,
        requirements,
      }),
    );
  } else {
    dispatch(
      arrayPush(props.formName, 'steps', {
        id: null,
        ...formValues,
        votesLimit: formValues.isLimitEnabled ? formValues.votesLimit : null,
        votesMin: formValues.isLimitEnabled ? formValues.votesMin : null,
        requirements,
      }),
    );
  }

  if (props.handleClose) {
    props.handleClose();
  }
};

const validate = (
  {
    __typename,
    label,
    title,
    startAt,
    questionnaire,
    consultations,
    votesLimit,
    votesMin,
    proposalForm,
    votesRanking,
  }: FormValues,
  { features }: Props,
) => {
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

  if (__typename === 'QuestionnaireStep') {
    if (!questionnaire) errors.questionnaire = 'global.required';
  }

  if (__typename === 'CollectStep') {
    if (!proposalForm) errors.proposalForm = 'global.required';
  }

  if (__typename === 'ConsultationStep') {
    if (!consultations || !consultations.length) errors.consultations = 'global.required';
  }

  if (features.votes_min) {
    if (
      votesLimit != null &&
      parseInt(votesLimit, 10) < parseInt(votesMin, 10) &&
      parseInt(votesLimit, 10) > 0
    ) {
      errors.votesMin = 'maximum-vote-must-be-higher-than-minimum';
    }
    if (parseInt(votesMin, 10) < 0) {
      errors.votesMin = 'minimum-vote-must-be-greater-than-or-equal';
    }
  }

  if (__typename === 'DebateStep') {
    errors.question = 'global.required';
  }

  // eslint-disable-next-line no-restricted-globals
  if (features.votes_min && isNaN(parseInt(votesLimit, 10)) && votesLimit) {
    errors.votesLimit = 'maximum-vote-must-be-greater-than-or-equal';
  }

  if (votesRanking && parseInt(votesLimit, 10) != null && parseInt(votesLimit, 10) <= 0) {
    errors.votesLimit = 'maximum-vote-must-be-greater-than-or-equal';
  }
  return errors;
};

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

const AppBoxNoMargin = styled(AppBox)`
  .form-group,
  .form-group label {
    margin-bottom: 0 !important;
  }
`;

export function ProjectAdminStepForm({
  step,
  handleSubmit,
  handleClose,
  form,
  intl,
  formName,
  timeless,
  isAnonymousParticipationAllowed,
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
  debateType,
}: Props) {
  const canSetDisplayMode =
    (step.__typename === 'SelectionStep' || step.__typename === 'CollectStep') &&
    (isGridViewEnabled || isListViewEnabled || isMapViewEnabled);

  const unstable__anonymous_questionnaire = useFeatureFlag('unstable__anonymous_questionnaire');

  React.useEffect(() => {
    // mainView is not in the reduxForm's initialValues because the proposalForm is selected after.
    // Normally, need to use enableReinitialize but it resets the form...
    if (mainView && isCreating && step.__typename === 'CollectStep') {
      dispatch(change(stepFormName, 'mainView', mainView));
    }
  }, [dispatch, isCreating, mainView, step.__typename]);

  const hasCheckedRequirements = requirements
    ? requirements.some(requirement => requirement.checked)
    : false;

  return (
    <>
      <Modal.Body>
        <FormContainer onSubmit={handleSubmit} id={form}>
          {step.__typename !== 'DebateStep' && renderSubSection('global.general')}

          {step.__typename === 'DebateStep' && (
            <>
              <p className="mb-20">
                <FormattedMessage id="debate.__typename.question" />
              </p>
              <Field
                type="radio"
                name="debateType"
                id="step-debate-type-face-to-face"
                component={renderComponent}
                value="FACE_TO_FACE">
                <FormattedMessage id="debate.__typename.face-to-face" />
              </Field>

              <Field
                type="radio"
                name="debateType"
                id="step-debate-type-wysiwyg"
                component={renderComponent}
                value="WYSIWYG">
                <FormattedMessage id="debate.__typename.advanced" />
              </Field>
            </>
          )}

          <Field
            type="text"
            name="label"
            id="step-label"
            placeholder={
              step.__typename === 'DebateStep' ? 'placeholderText.debat.menuLabel' : undefined
            }
            label={<FormattedMessage id="color.main_menu.text" />}
            component={renderComponent}
          />

          {step.__typename !== 'DebateStep' && (
            <Field
              type="text"
              name="title"
              id="step-title"
              label={<FormattedMessage id="global.title" />}
              component={renderComponent}
            />
          )}

          {step.__typename === 'DebateStep' && (
            <Field
              type="textarea"
              name="title"
              id="step-question"
              label={<FormattedMessage id="debate.question" />}
              placeholder="placeholderText.debat.questionLabel"
              component={renderComponent}
              value={step?.debateContent}
            />
          )}

          {debateType === 'WYSIWYG' && (
            <Field
              type="admin-editor"
              name="debateContent"
              id="step-debate-content"
              label={<FormattedMessage id="debate.content" />}
              placeholder={<FormattedMessage id="debate.content" />}
              component={renderComponent}
            />
          )}

          {step.__typename !== 'PresentationStep' && (
            <>
              {(step.__typename === 'SelectionStep' ||
                step.__typename === 'CollectStep' ||
                step.__typename === 'QuestionnaireStep' ||
                step.__typename === 'ConsultationStep' ||
                step.__typename === 'DebateStep') && (
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
          {step.__typename === 'QuestionnaireStep' && unstable__anonymous_questionnaire && (
            <>
              <Field
                component={toggle}
                name="isAnonymousParticipationAllowed"
                id="step-isAnonymousParticipationAllowed"
                normalize={val => !!val}
                label={<FormattedMessage id="allow-debate-anonymous-participation" />}
                disabled={hasCheckedRequirements}
              />
              {isAnonymousParticipationAllowed && (
                <AppBoxNoMargin ml={4} mb={5}>
                  <Field
                    name="collectParticipantsEmail"
                    component={renderComponent}
                    type="checkbox"
                    id="collectParticipantsEmail">
                    <Text color="gray.900">
                      {intl.formatMessage({ id: 'collect-particpants-email' })}
                    </Text>
                  </Field>
                  <Text ml="2.5rem" color="gray.700">
                    {intl.formatMessage({ id: 'collect-particpants-email-help' })}
                  </Text>
                </AppBoxNoMargin>
              )}
            </>
          )}
          {step.__typename === 'DebateStep' && (
            <Field
              icons
              component={toggle}
              name="isAnonymousParticipationAllowed"
              id="step-isAnonymousParticipationAllowed"
              normalize={val => !!val}
              helpText={<FormattedMessage id="allow-debate-anonymous-participation-help-text" />}
              label={<FormattedMessage id="allow-debate-anonymous-participation" />}
            />
          )}

          {step.__typename !== 'DebateStep' && (
            <Field
              type="editor"
              name="body"
              id="step-body"
              label={renderLabel('proposal.body', intl)}
              component={renderComponent}
            />
          )}

          <Field
            name="metaDescription"
            type="textarea"
            id="step-metaDescription"
            label={renderLabel('global.meta.description', intl, 'admin.help.metadescription')}
            component={renderComponent}
          />

          {step.__typename === 'QuestionnaireStep' && (
            <ProjectAdminQuestionnaireStepForm
              questionnaire={step.questionnaire}
              stepFormName={stepFormName}
              requirements={requirements}
              isAnonymousParticipationAllowed={isAnonymousParticipationAllowed}
            />
          )}
          {step.__typename === 'ConsultationStep' && (
            <ProjectAdminConsultationStepForm
              requirements={requirements}
              consultations={step.consultations}
            />
          )}
          {step.__typename === 'SelectionStep' && (
            <ProjectAdminSelectionStepForm
              isBudgetEnabled={isBudgetEnabled}
              isTresholdEnabled={isTresholdEnabled}
              isLimitEnabled={isLimitEnabled}
              stepFormName={stepFormName}
              votesMin={step?.votesMin || 1}
              votesLimit={step?.votesLimit || null}
              votesRanking={step?.votesRanking || false}
              allowAuthorsToAddNews={step.allowAuthorsToAddNews || false}
              statuses={statuses}
              votable={votable}
              requirements={requirements}
            />
          )}

          {step.__typename === 'RankingStep' && <ProjectAdminRankingStepForm />}

          {step.__typename === 'CollectStep' && (
            <ProjectAdminCollectStepForm
              isPrivate={isPrivate}
              proposal={step.proposalForm}
              isBudgetEnabled={isBudgetEnabled}
              isTresholdEnabled={isTresholdEnabled}
              isLimitEnabled={isLimitEnabled}
              stepFormName={stepFormName}
              votesMin={step?.votesMin || 1}
              votesLimit={step?.votesLimit || null}
              votesRanking={step?.votesRanking || false}
              allowAuthorsToAddNews={step?.allowAuthorsToAddNews || false}
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

          {step.__typename === 'DebateStep' && debateType === 'FACE_TO_FACE' && <StepArticle />}

          {step.__typename === 'DebateStep' && step.debate && isAnonymousParticipationAllowed && (
            <Accordion>
              <Accordion.Item id="integration-parameter">
                <Accordion.Button px={0}>
                  <Heading as="h4">
                    <FormattedMessage id="integration-parameter" tagName={React.Fragment} />
                  </Heading>
                </Accordion.Button>

                <Accordion.Panel px={0}>
                  <DebateWidgetForm debateId={step.debate.id} />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          )}

          {step.__typename !== 'DebateStep' && renderSubSection('global.publication')}
          <>
            <Field
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

          {step.__typename !== 'DebateStep' && renderSubSection('global-customization')}
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
  const twilioEnabled = state.default.features.twilio;
  return {
    features: state.default.features,
    initialValues: {
      // AbstractStep
      url: step?.url ? step.url : null,
      __typename: step?.__typename ? step.__typename : null,
      label: step?.label ? step.label : null,
      body: step?.body ? step.body : null,
      title: step?.title ? step.title : null,
      endAt: step?.endAt ? step.endAt : null,
      startAt: step?.startAt || moment(),
      isEnabled: step?.isEnabled ? step.isEnabled : true,
      timeless: step?.timeless ? step.timeless : false,
      isAnonymousParticipationAllowed: step?.isAnonymousParticipationAllowed
        ? step.isAnonymousParticipationAllowed
        : false,
      metaDescription: step?.metaDescription ? step.metaDescription : null,
      customCode: step?.customCode ? step.customCode : null,
      requirementsReason: step?.requirementsReason || null,
      isGridViewEnabled,
      isListViewEnabled,
      isMapViewEnabled,
      mainView,
      // DebateStep
      debateType: step.__typename === 'DebateStep' ? step?.debateType || 'FACE_TO_FACE' : undefined,
      debateContent: step.__typename === 'DebateStep' ? step?.debateContent : undefined,
      // QuestionnaireStep
      questionnaire: step?.questionnaire || null,
      footer: step?.footer ? step.footer : null,
      collectParticipantsEmail:
        step?.collectParticipantsEmail !== undefined
          ? step.collectParticipantsEmail
          : step.__typename === 'QuestionnaireStep'
          ? true
          : undefined,
      // ConsultationStep
      consultations: step?.consultations || [],
      requirements: step ? createRequirements(step, twilioEnabled) : [],
      // SelectionStep
      statuses: step?.statuses?.length ? step.statuses : [],
      defaultSort: step?.defaultSort?.toUpperCase() || 'RANDOM',
      allowingProgressSteps: step?.allowingProgressSteps || false,
      // CollectStep
      defaultStatus: step?.defaultStatus || null,
      proposalForm: step?.proposalForm || null,
      // RankingStep
      nbVersionsToDisplay: step?.nbVersionsToDisplay || null,
      nbOpinionsToDisplay: step?.nbOpinionsToDisplay || null,
      // DebateStep
      articles: step?.articles || [],
      widget: {
        background: '#fff',
        border: '#fff',
        width: '100%',
        height: '90vh',
        destination: null,
      },
      // Votable Trait
      votable: step?.votable || false,
      votesHelpText: step?.votesHelpText || null,
      votesMin: step?.votesMin || null,
      votesLimit: step?.votesLimit || null,
      votesRanking: step?.votesRanking || false,
      voteThreshold: step?.voteThreshold || null,
      allowAuthorsToAddNews: step?.allowAuthorsToAddNews || false,
      budget: step?.budget || null,
      isBudgetEnabled: step?.isBudgetEnabled || false,
      isLimitEnabled: step?.votesMin !== null || step?.votesLimit !== null || false,
      isTresholdEnabled: step?.isTresholdEnabled || false,
      private: step?.private || false,
    },
    isBudgetEnabled: formValueSelector(stepFormName)(state, 'isBudgetEnabled') || false,
    isLimitEnabled: formValueSelector(stepFormName)(state, 'isLimitEnabled') || false,
    isTresholdEnabled: formValueSelector(stepFormName)(state, 'isTresholdEnabled') || false,
    isGridViewEnabled:
      step.__typename === 'CollectStep'
        ? formValueSelector(stepFormName)(state, 'proposalForm')?.isGridViewEnabled
        : formValueSelector(stepFormName)(state, 'isGridViewEnabled'),
    isListViewEnabled:
      step.__typename === 'CollectStep'
        ? formValueSelector(stepFormName)(state, 'proposalForm')?.isListViewEnabled
        : formValueSelector(stepFormName)(state, 'isListViewEnabled'),
    isMapViewEnabled:
      step.__typename === 'CollectStep'
        ? formValueSelector(stepFormName)(state, 'proposalForm')?.isMapViewEnabled
        : formValueSelector(stepFormName)(state, 'isMapViewEnabled'),
    mainView: formValueSelector(stepFormName)(state, 'mainView') || mainView,
    votable: formValueSelector(stepFormName)(state, 'votable') || false,
    timeless: formValueSelector(stepFormName)(state, 'timeless') || false,
    isAnonymousParticipationAllowed:
      formValueSelector(stepFormName)(state, 'isAnonymousParticipationAllowed') || false,
    requirements: formValueSelector(stepFormName)(state, 'requirements') || [],
    statuses: formValueSelector(stepFormName)(state, 'statuses') || [],
    // "private" is a reserved word in js (will be)
    isPrivate: formValueSelector(stepFormName)(state, 'private') || false,
    // DebateStep
    debateType: formValueSelector(stepFormName)(state, 'debateType') || 'FACE_TO_FACE',
  };
};

const form = injectIntl(
  reduxForm({
    validate,
    onSubmit,
    form: stepFormName,
  })(ProjectAdminStepForm),
);

const ProjectAdminStepFormConnected = connect<any, any, _, _, _, _>(mapStateToProps)(form);

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
