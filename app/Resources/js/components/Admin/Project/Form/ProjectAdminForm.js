// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import { graphql, createFragmentContainer } from 'react-relay';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';

import AlertForm from '../../../Alert/AlertForm';
import type { Dispatch, GlobalState } from '~/types';
import AppDispatcher from '~/dispatchers/AppDispatcher';

import { UPDATE_ALERT } from '~/constants/AlertConstants';
import CreateProjectMutation from '~/mutations/CreateProjectMutation';
import UpdateProjectMutation from '~/mutations/UpdateProjectMutation';
import { type ProjectAdminForm_project } from '~relay/ProjectAdminForm_project.graphql';

import ProjectStepAdmin from '../Steps/ProjectStepAdmin';
import ProjectMetadataAdminPage from '../Metadata/ProjectMetadataAdminPage';
import ProjectExternalAdminPage from '../External/ProjectExternalAdminPage';

import ProjectContentAdminForm, {
  type FormValues as ContentFormValues,
  validate as validateContent,
} from '../Content/ProjectContentAdminForm';
import {
  type FormValues as MetadataFormValues,
  validate as validateMetadata,
} from '../Metadata/ProjectMetadataAdminForm';
import {
  type FormValues as ExternalFormValues,
  validate as validateExternal,
} from '../External/ProjectExternalAdminForm';
import { type FormValues as StepFormValues } from '../Step/ProjectAdminStepForm';

type Props = {|
  ...ReduxFormFormProps,
  project: ProjectAdminForm_project,
  intl: IntlShape,
  formName: string,
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

type FormValues = {|
  ...ContentFormValues,
  ...StepFormValues,
  ...MetadataFormValues,
  ...ExternalFormValues,
|};

const onSubmit = (
  { title, authors, opinionTerm, projectType }: FormValues,
  dispatch: Dispatch,
  props: Props,
) => {
  const input = {
    title,
    opinionTerm,
    projectType,
    authors: formatAuthors(authors),
  };
  if (props.project) {
    return UpdateProjectMutation.commit({
      input: {
        id: props.project.id,
        ...input,
      },
    }).then(data => {
      if (data.updateProject && data.updateProject.project) {
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'alert.success.report.argument' },
        });
      }
    });
  }
  return CreateProjectMutation.commit({ input }).then(data => {
    if (data.createProject && data.createProject.project) {
      window.location.href = data.createProject.project.adminUrl;
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
    ...validateExternal({
      externalLink,
      externalVotesCount,
      isExternal,
      externalParticipantsCount,
      externalContributionsCount,
    }),
    ...validateMetadata({ publishedAt, video, themes, districts, Cover }),
    ...validateContent({ title, authors, opinionTerm, projectType }),
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
    <div className="box box-primary container-fluid">
      <div className="box-content mt-20">
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
  const { handleSubmit } = props;

  return (
    <form onSubmit={handleSubmit} id={formName}>
      <ProjectContentAdminForm {...props} formName={formName} />
      <ProjectStepAdmin form={formName} />
      <ProjectExternalAdminPage {...props} formName={formName} />
      <ProjectMetadataAdminPage {...props} formName={formName} />
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
    steps: project ? project.steps : [],
  },
});

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
      type {
        id
      }
      authors {
        value: id
        label: username
      }
      steps {
        id
        body
        type
        title
        timeRange {
          startAt
          endAt
        }
      }
      opinionTerm
      ...ProjectContentAdminForm_project
      ...ProjectMetadataAdminPage_project
      ...ProjectExternalAdminPage_project
    }
  `,
});
