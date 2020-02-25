// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { reduxForm, formValueSelector } from 'redux-form';
import { graphql, createFragmentContainer } from 'react-relay';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';
import moment from 'moment';

import AlertForm from '../../../Alert/AlertForm';
import type { Dispatch, GlobalState } from '~/types';
import AppDispatcher from '~/dispatchers/AppDispatcher';

import { UPDATE_ALERT } from '~/constants/AlertConstants';
import CreateProjectAlphaMutation from '~/mutations/CreateProjectAlphaMutation';
import UpdateProjectAlphaMutation from '~/mutations/UpdateProjectAlphaMutation';
import { type ProjectAdminForm_project } from '~relay/ProjectAdminForm_project.graphql';

import ProjectStepAdmin from '../Steps/ProjectStepAdmin';
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
import { type ProjectStepInput } from '~relay/UpdateProjectAlphaMutation.graphql';
import { type ConcreteStepType } from '~relay/CreateProjectAlphaMutation.graphql';

type Props = {|
  ...ReduxFormFormProps,
  project: ProjectAdminForm_project,
  intl: IntlShape,
  title: string,
  onTitleChange: string => void,
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

type StepTypes = {| steps: Array<ProjectStepInput> |};

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
    externalLink,
    externalParticipantsCount,
    externalContributionsCount,
    externalVotesCount,
    isExternal,
    publishedAt: moment(publishedAt).format('YYYY-MM-DD HH:mm:ss'),
    visibility,
    opinionCanBeFollowed,
    steps: steps
      ? steps.map((step: ProjectStepInput) =>
          step.requirements?.length
            ? {
                ...step, // $FlowFixMe reason is in a different place within the query and the mutation type
                requirementsReason: step.requirements[0].reason,
                startAt: moment(step.startAt).format('YYYY-MM-DD HH:mm:ss'),
                endAt: moment(step.endAt).format('YYYY-MM-DD HH:mm:ss'),
                type: convertTypenameToConcreteStepType(step.type),
              }
            : {
                ...step,
                requirements: [],
                startAt: moment(step.startAt).format('YYYY-MM-DD HH:mm:ss'),
                endAt: moment(step.endAt).format('YYYY-MM-DD HH:mm:ss'),
                type: convertTypenameToConcreteStepType(step.type),
              },
        )
      : [],
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
          alert: { bsStyle: 'success', content: 'alert.success.report.argument' },
        });
      }
    });
  }
  return CreateProjectAlphaMutation.commit({ input }).then(data => {
    if (data.createAlphaProject && data.createAlphaProject.project) {
      window.location.href = data.createAlphaProject.project.adminUrl;
      AppDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'alert.success.report.argument' },
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
  } = props;
  return {
    // TODO validate steps after rework
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
    ...validatePublish({ publishedAt }),
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
    <div className="box box-primary">
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
    </div>
  </div>
);

const formName = 'projectAdminForm';

export function ProjectAdminForm(props: Props) {
  const { handleSubmit, title, onTitleChange, ...rest } = props;
  onTitleChange(title);
  return (
    <form onSubmit={handleSubmit} id={formName}>
      <ProjectContentAdminForm handleSubmit={handleSubmit} {...rest} />
      <ProjectExternalAdminPage handleSubmit={handleSubmit} {...rest} formName={formName} />
      <ProjectStepAdmin form={formName} />
      <ProjectAccessAdminForm {...props} formName={formName} />
      <ProjectProposalsAdminForm handleSubmit={handleSubmit} {...rest} />
      <ProjectPublishAdminForm handleSubmit={handleSubmit} {...rest} />
      {renderProjectSave(props)}
    </form>
  );
}

const mapStateToProps = (state: GlobalState, { project }: Props) => ({
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
        }))
      : [],
    visibility: project ? project.visibility : 'ADMIN',
    publishedAt: project ? project.publishedAt : null,
    themes: project ? project.themes && project.themes.map(theme => theme) : [],
    video: project ? project.video : null,
    Cover: project ? project.Cover : null,
    opinionCanBeFollowed: project ? project.opinionCanBeFollowed : null,
    isExternal: project ? project.isExternal : false,
    metaDescription: project ? project.metaDescription : null,
    districts:
      project?.districts?.edges
        ?.filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map(d => {
          return { value: d.value, label: d.label };
        }) || [],
  },
  title: formValueSelector(formName)(state, 'title'),
});

const form = injectIntl(
  reduxForm({
    validate,
    onSubmit,
    form: formName,
  })(ProjectAdminForm),
);

const container = connect(mapStateToProps)(form);

// Will be reduced when steps are reworked
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
      districts {
        edges {
          node {
            value: id
            label: name
          }
        }
      }
      steps {
        id
        body
        type: __typename
        title
        startAt: timeRange {
          startAt
        }
        endAt: timeRange {
          endAt
        }
        label
        isEnabled: enabled
        ... on CollectStep {
          requirements {
            reason
          }
        }
        ... on SelectionStep {
          requirements {
            reason
          }
        }
        ... on ConsultationStep {
          requirements {
            reason
          }
        }
        ... on RequirementStep {
          requirements {
            reason
          }
        }
        ... on ProposalStep {
          requirements {
            reason
          }
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
      url
      ...ProjectContentAdminForm_project
      ...ProjectExternalAdminPage_project
      ...ProjectAccessAdminForm_project
      ...ProjectProposalsAdminForm_project
      ...ProjectPublishAdminForm_project
    }
  `,
});
