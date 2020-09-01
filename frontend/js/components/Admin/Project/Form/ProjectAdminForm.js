// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { reduxForm, formValueSelector } from 'redux-form';
import { graphql, createFragmentContainer } from 'react-relay';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';
import moment from 'moment';
import debounce from 'lodash/debounce';

import AlertForm from '../../../Alert/AlertForm';
import type { Dispatch, FeatureToggles, GlobalState } from '~/types';
import AppDispatcher from '~/dispatchers/AppDispatcher';

import { UPDATE_ALERT } from '~/constants/AlertConstants';
import CreateProjectAlphaMutation from '~/mutations/CreateProjectAlphaMutation';
import UpdateProjectAlphaMutation from '~/mutations/UpdateProjectAlphaMutation';
import { type ProjectAdminForm_project } from '~relay/ProjectAdminForm_project.graphql';

import ProjectStepAdmin, { validate as validateSteps } from '../Steps/ProjectStepAdmin';
import ProjectExternalAdminPage from '../External/ProjectExternalAdminPage';

import ProjectContentAdminForm, {
  type FormValues as ContentFormValues,
  validate as validateContent,
} from '../Content/ProjectContentAdminForm';
import {
  type FormValues as ExternalFormValues,
  validate as validateExternal,
} from '../External/ProjectExternalAdminForm';
import ProjectPublishAdminForm, {
  type FormValues as PublishFormValues,
  validate as validatePublish,
} from '../Publish/ProjectPublishAdminForm';
import ProjectAccessAdminForm, {
  type FormValues as AccessFormValues,
} from '../Access/ProjectAccessAdminForm';
import ProjectProposalsAdminForm, {
  type FormValues as ProposalsFormValues,
} from '../Proposals/ProjectProposalsAdminForm';
import { type ConcreteStepType } from '~relay/CreateProjectAlphaMutation.graphql';
import { ProjectBoxContainer } from './ProjectAdminForm.style';

type Props = {|
  ...ReduxFormFormProps,
  project: ProjectAdminForm_project,
  features: FeatureToggles,
  intl: IntlShape,
  title: string,
  onTitleChange: string => void,
  initialGroups: Array<{| label: string, value: string |}>,
|};

export type Author = {|
  value: string,
  label: string,
|};

const opinionTerms = [
  {
    id: 0,
    label: 'project.opinion_term.opinion',
  },
  {
    id: 1,
    label: 'project.opinion_term.article',
  },
];

const formatAuthors = (authors: Author[]): string[] => authors.map(author => author.value);

const getViewEnabled = (stepType: string, proposalForm, firstCollectStepForm) => {
  if (stepType === 'CollectStep') {
    return {
      isGridViewEnabled: proposalForm?.isGridViewEnabled,
      isListViewEnabled: proposalForm?.isListViewEnabled,
      isMapViewEnabled: proposalForm?.isMapViewEnabled,
    };
  }

  if (stepType === 'SelectionStep') {
    return {
      isGridViewEnabled: firstCollectStepForm?.isGridViewEnabled,
      isListViewEnabled: firstCollectStepForm?.isListViewEnabled,
      isMapViewEnabled: firstCollectStepForm?.isMapViewEnabled,
    };
  }

  return {};
};

// Initially I planned to do typename.slice(0, -4).toUpperCase() but Flow being Flow, I can't ¯\_(ツ)_/¯
const convertTypenameToConcreteStepType = (typename: string): ConcreteStepType => {
  switch (typename) {
    case 'CollectStep':
      return 'COLLECT';
    case 'ConsultationStep':
      return 'CONSULTATION';
    case 'PresentationStep':
      return 'PRESENTATION';
    case 'QuestionnaireStep':
      return 'QUESTIONNAIRE';
    case 'RankingStep':
      return 'RANKING';
    case 'SelectionStep':
      return 'SELECTION';
    case 'SynthesisStep':
      return 'SYNTHESIS';
    case 'OtherStep':
    default:
      return 'OTHER';
  }
};

// For now as of union input on graphQL are not supported
export type StepTypes = {| steps: Array<any> |};

type FormValues = {|
  ...ContentFormValues,
  ...StepTypes,
  ...ExternalFormValues,
  ...PublishFormValues,
  ...ProposalsFormValues,
  ...AccessFormValues,
|};

const onSubmit = (
  {
    title,
    authors,
    opinionTerm,
    projectType,
    Cover,
    video,
    themes,
    metaDescription,
    isExternal,
    externalLink,
    externalParticipantsCount,
    externalContributionsCount,
    externalVotesCount,
    publishedAt,
    visibility,
    districts,
    opinionCanBeFollowed,
    steps,
    locale,
    restrictedViewerGroups,
  }: FormValues,
  dispatch: Dispatch,
  props: Props,
) => {
  const input = {
    title,
    authors: formatAuthors(authors),
    opinionTerm,
    projectType,
    Cover: Cover ? Cover.id : null,
    video,
    themes: themes ? themes.map(theme => theme.value) : [],
    districts: districts ? districts.map(district => district.value) : [],
    metaDescription,
    externalLink: isExternal ? externalLink : undefined,
    externalParticipantsCount: isExternal ? externalParticipantsCount : undefined,
    externalContributionsCount: isExternal ? externalContributionsCount : undefined,
    externalVotesCount: isExternal ? externalVotesCount : undefined,
    isExternal,
    publishedAt: moment(publishedAt).format('YYYY-MM-DD HH:mm:ss'),
    visibility,
    restrictedViewerGroups:
      visibility === 'CUSTOM' ? restrictedViewerGroups.map(g => g.value) : undefined,
    opinionCanBeFollowed,
    steps: steps // I cannot type step properly given the unability to create union Input type
      ? steps.map(({ url, ...s }: any) => ({
          ...s,
          isGridViewEnabled: undefined,
          isListViewEnabled: undefined,
          isMapViewEnabled: undefined,
          timeless:
            s.type === 'SelectionStep' ||
            s.type === 'CollectStep' ||
            s.type === 'QuestionnaireStep' ||
            s.type === 'ConsultationStep'
              ? s.timeless
              : undefined,
          startAt:
            s.startAt && !s.timeless ? moment(s.startAt).format('YYYY-MM-DD HH:mm:ss') : null,
          endAt: s.endAt && !s.timeless ? moment(s.endAt).format('YYYY-MM-DD HH:mm:ss') : null,
          questionnaire: s.questionnaire?.value || undefined,
          proposalForm: s.proposalForm?.value || undefined,
          consultations: s.consultations?.length ? s.consultations.map(c => c.value) : undefined,
          footer: s.type === 'QuestionnaireStep' ? s.footer : undefined,
          type: convertTypenameToConcreteStepType(s.type),
          mainView: s.type === 'CollectStep' || s.type === 'SelectionStep' ? s.mainView : undefined,
          requirements: s.requirements?.length ? s.requirements : [],
          requirementsReason:
            s.type === 'ConsultationStep' || s.type === 'CollectStep'
              ? s.requirementsReason
              : undefined,
          proposalsHidden: s.type === 'SelectionStep' ? s.proposalsHidden : undefined,
          statuses: s.type === 'SelectionStep' || s.type === 'CollectStep' ? s.statuses : undefined,
          defaultStatus:
            s.type === 'SelectionStep' || s.type === 'CollectStep'
              ? s.defaultStatus?.value || s.defaultStatus
              : undefined,
          private: s.type === 'CollectStep' ? s.private : undefined,
          defaultSort:
            s.type === 'SelectionStep' || s.type === 'CollectStep' ? s.defaultSort : undefined,
          votesHelpText:
            s.type === 'SelectionStep' || s.type === 'CollectStep'
              ? s.votable
                ? s.votesHelpText
                : null
              : undefined,
          voteType:
            s.type === 'SelectionStep' || s.type === 'CollectStep'
              ? !s.votable
                ? 'DISABLED'
                : s.budget && s.isBudgetEnabled
                ? 'BUDGET'
                : 'SIMPLE'
              : undefined,
          budget:
            s.type === 'SelectionStep' || s.type === 'CollectStep'
              ? s.isBudgetEnabled && s.votable
                ? s.budget
                : null
              : undefined,
          votesLimit:
            s.type === 'SelectionStep' || s.type === 'CollectStep'
              ? s.isLimitEnabled && s.votable
                ? s.votesLimit
                : null
              : undefined,
          voteThreshold:
            s.type === 'SelectionStep' || s.type === 'CollectStep'
              ? s.isTresholdEnabled && s.votable
                ? s.voteThreshold
                : null
              : undefined,
          votesRanking:
            s.type === 'SelectionStep' || s.type === 'CollectStep' ? s.votesRanking : undefined,
          allowingProgressSteps: s.type === 'SelectionStep' ? s.allowingProgressSteps : undefined,
          nbOpinionsToDisplay: s.type === 'RankingStep' ? s.nbOpinionsToDisplay : undefined,
          nbVersionsToDisplay: s.type === 'RankingStep' ? s.nbVersionsToDisplay : undefined,
          votable: undefined,
          isBudgetEnabled: undefined,
          isTresholdEnabled: undefined,
          isLimitEnabled: undefined,
        }))
      : [],
    locale: locale ? locale.value : null,
  };
  if (props.project) {
    return UpdateProjectAlphaMutation.commit({
      input: {
        projectId: props.project.id,
        ...input,
      },
    }).then(data => {
      if (data.updateAlphaProject && data.updateAlphaProject.project) {
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'all.data.saved' },
        });
      }
    });
  }
  return CreateProjectAlphaMutation.commit({ input }).then(data => {
    if (data.createAlphaProject && data.createAlphaProject.project) {
      window.location.href = data.createAlphaProject.project.adminUrl;
      AppDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'all.data.saved' },
      });
    }
  });
};

const validate = (props: FormValues) => {
  const {
    Cover,
    title,
    video,
    themes,
    metaDescription,
    authors,
    districts,
    isExternal,
    publishedAt,
    opinionTerm,
    projectType,
    externalLink,
    externalVotesCount,
    externalParticipantsCount,
    externalContributionsCount,
    steps,
    locale,
  } = props;
  return {
    ...validateSteps({ steps }),
    ...validateContent({
      title,
      authors,
      opinionTerm,
      projectType,
      video,
      themes,
      districts,
      Cover,
      metaDescription,
    }),
    ...validateExternal({
      externalLink,
      externalVotesCount,
      isExternal,
      externalParticipantsCount,
      externalContributionsCount,
    }),
    ...validatePublish({ publishedAt, locale }),
  };
};

const renderProjectSave = ({
  invalid,
  submitting,
  pristine,
  valid,
  submitSucceeded,
  submitFailed,
}: Props) => (
  <div className="col-md-12">
    <ProjectBoxContainer className="box container-fluid">
      <div className="box-content p-15">
        <Button
          id="submit-project-content"
          type="submit"
          disabled={invalid || submitting || pristine}
          bsStyle="primary">
          {submitting ? (
            <FormattedMessage id="global.loading" />
          ) : (
            <FormattedMessage id="global.save" />
          )}
        </Button>
        <AlertForm
          valid={valid}
          invalid={invalid && !pristine}
          submitSucceeded={submitSucceeded}
          submitFailed={submitFailed}
          submitting={submitting}
        />
      </div>
    </ProjectBoxContainer>
  </div>
);

const formName = 'projectAdminForm';

const changeTitle = debounce((onTitleChange, title) => {
  onTitleChange(title);
}, 1000);

export function ProjectAdminForm(props: Props) {
  const { handleSubmit, title, onTitleChange, project, features, initialGroups, ...rest } = props;
  changeTitle(onTitleChange, title);
  return (
    <form onSubmit={handleSubmit} id={formName}>
      <ProjectContentAdminForm project={project} handleSubmit={handleSubmit} {...rest} />
      <ProjectExternalAdminPage
        project={project}
        handleSubmit={handleSubmit}
        formName={formName}
        {...rest}
      />
      <ProjectStepAdmin handleSubmit={handleSubmit} form={formName} project={project} {...rest} />
      <ProjectAccessAdminForm {...props} formName={formName} initialGroups={initialGroups} />
      <ProjectProposalsAdminForm project={project} handleSubmit={handleSubmit} {...rest} />
      <ProjectPublishAdminForm
        project={project}
        handleSubmit={handleSubmit}
        features={features}
        {...rest}
      />
      {renderProjectSave(props)}
    </form>
  );
}

const mapStateToProps = (state: GlobalState, { project }: Props) => {
  return {
    features: state.default.features,
    initialValues: {
      opinionTerm: project ? project.opinionTerm : opinionTerms[0].id,
      authors: project ? project.authors : [],
      title: project ? project.title : null,
      projectType: project && project.type ? project.type.id : null,
      steps: project?.steps
        ? project.steps.map(step => ({
            ...step,
            endAt: step?.endAt?.endAt ? step.endAt.endAt : null,
            startAt: step?.startAt?.startAt ? step.startAt.startAt : null,
            requirements: step.requirements?.edges?.map(edge => ({
              ...edge?.node,
              type:
                edge?.node?.type === 'DateOfBirthRequirement'
                  ? 'DATE_OF_BIRTH'
                  : edge?.node?.type.slice(0, -11).toUpperCase(),
            })),
            requirementsReason: step.requirements?.reason || null,
            consultations: step.consultations?.edges?.map(edge => edge?.node) || [],
            isBudgetEnabled: !!step.budget,
            isLimitEnabled: !!step.votesLimit,
            isTresholdEnabled: !!step.voteThreshold,
            defaultSort: step.defaultSort?.toUpperCase() || 'RANDOM',
            ...getViewEnabled(step.type, step.proposalForm, project?.firstCollectStep?.form),
          }))
        : [],
      visibility: project ? project.visibility : 'ADMIN',
      publishedAt: project ? project.publishedAt : null,
      themes: project ? project.themes && project.themes.map(theme => theme) : [],
      video: project ? project.video : null,
      Cover: project ? project.Cover : null,
      opinionCanBeFollowed: project ? project.opinionCanBeFollowed : null,
      isExternal: project ? project.isExternal : false,
      externalLink: project ? project.externalLink : null,
      externalContributionsCount: project ? project.externalContributionsCount : null,
      externalParticipantsCount: project ? project.externalParticipantsCount : null,
      externalVotesCount: project ? project.externalVotesCount : null,
      metaDescription: project ? project.metaDescription : null,
      districts:
        project?.districts?.edges
          ?.filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(d => {
            return { value: d.value, label: d.label };
          }) || [],
      restrictedViewerGroups:
        project?.restrictedViewers?.edges
          ?.filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(d => {
            return { value: d.value, label: d.label };
          }) || [],
      locale:
        project && project.locale
          ? {
              value: project.locale.value,
              label: <FormattedMessage id={project.locale.label} />,
            }
          : null,
    },
    title: formValueSelector(formName)(state, 'title'),
    initialGroups: formValueSelector(formName)(state, 'restrictedViewersGroups') || [],
  };
};

const form = injectIntl(
  reduxForm({
    validate,
    onSubmit,
    form: formName,
  })(ProjectAdminForm),
);

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(container, {
  project: graphql`
    fragment ProjectAdminForm_project on Project {
      id
      title
      metaDescription
      authors {
        value: id
        label: username
      }
      opinionTerm
      type {
        id
      }
      Cover: cover {
        id
        name
        size
        url
      }
      video
      themes {
        value: id
        label: title
      }
      restrictedViewers {
        edges {
          node {
            value: id
            label: title
          }
        }
      }
      districts {
        edges {
          node {
            value: id
            label: name
          }
        }
      }
      firstCollectStep {
        form {
          isGridViewEnabled
          isListViewEnabled
          isMapViewEnabled
        }
      }
      steps {
        id
        body
        timeless
        type: __typename
        title
        startAt: timeRange {
          startAt
        }
        endAt: timeRange {
          endAt
        }
        label
        customCode
        metaDescription
        isEnabled: enabled
        url
        ... on RankingStep {
          nbOpinionsToDisplay
          nbVersionsToDisplay
        }
        ... on CollectStep {
          defaultSort
          mainView
          proposalForm: form {
            value: id
            label: title
            isGridViewEnabled
            isListViewEnabled
            isMapViewEnabled
          }
          private
          defaultStatus {
            value: id
            label: name
          }
          statuses {
            id
            color
            name
          }
          votable
          votesHelpText
          votesLimit
          votesMin
          votesRanking
          voteThreshold
          voteType
          budget
          requirements {
            reason
            edges {
              node {
                id
                type: __typename
                ... on CheckboxRequirement {
                  label
                }
              }
            }
          }
        }
        ... on SelectionStep {
          statuses {
            id
            color
            name
          }
          defaultStatus {
            value: id
            label: name
          }
          votable
          votesHelpText
          votesLimit
          votesMin
          votesRanking
          voteThreshold
          voteType
          defaultSort
          proposalsHidden
          allowingProgressSteps
          budget
          mainView
          requirements {
            reason
            edges {
              node {
                id
                type: __typename
                ... on CheckboxRequirement {
                  label
                }
              }
            }
          }
        }
        ... on ConsultationStep {
          consultations {
            edges {
              node {
                value: id
                label: title
              }
            }
          }
          requirements {
            reason
            edges {
              node {
                id
                type: __typename
                ... on CheckboxRequirement {
                  label
                }
              }
            }
          }
        }
        ... on RequirementStep {
          requirements {
            reason
            edges {
              node {
                id
                type: __typename
                ... on CheckboxRequirement {
                  label
                }
              }
            }
          }
        }
        ... on ProposalStep {
          requirements {
            reason
            edges {
              node {
                id
                type: __typename
                ... on CheckboxRequirement {
                  label
                }
              }
            }
          }
        }
        ... on QuestionnaireStep {
          questionnaire {
            value: id
            label: title
          }
          footer
        }
      }
      visibility
      opinionTerm
      publishedAt
      opinionCanBeFollowed
      isExternal
      externalLink
      externalContributionsCount
      externalParticipantsCount
      externalVotesCount
      locale {
        value: id
        label: traductionKey
      }
      url
      ...ProjectStepAdmin_project
      ...ProjectContentAdminForm_project
      ...ProjectExternalAdminPage_project
      ...ProjectAccessAdminForm_project
      ...ProjectProposalsAdminForm_project
      ...ProjectPublishAdminForm_project
    }
  `,
});
