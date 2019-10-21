// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import { graphql, createFragmentContainer } from 'react-relay';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';

import AlertForm from '../../../Alert/AlertForm';
import type { Dispatch } from '../../../../types';
import AppDispatcher from '../../../../dispatchers/AppDispatcher';

import { UPDATE_ALERT } from '../../../../constants/AlertConstants';
import CreateProjectMutation from '../../../../mutations/CreateProjectMutation';
import UpdateProjectMutation from '../../../../mutations/UpdateProjectMutation';
import { type ProjectAdminForm_project } from '~relay/ProjectAdminForm_project.graphql';

import ProjectStepFormAdmin from '../Steps/ProjectStepFormAdmin';
import ProjectContentAdminForm from '../Content/ProjectContentAdminForm';

type Props = {|
  ...ReduxFormFormProps,
  project: ProjectAdminForm_project,
  intl: IntlShape,
  formName: string,
|};

type Author = {|
  value: string,
  label: string,
|};

type FormValues = {|
  title: string,
  authors: Author[],
  opinionTerm: number,
  projectType: string,
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

const validate = ({ title, authors }: FormValues) => {
  const errors = {};

  if (!title || title.length < 2) {
    errors.title = 'global.required';
  }

  if (!authors || authors.length <= 0) {
    errors.authors = 'global.required';
  }

  return errors;
};

const formName = 'projectAdminForm';

export const ProjectAdminForm = (props: Props) => {
  const {
    handleSubmit,
    valid,
    invalid,
    submitting,
    pristine,
    submitSucceeded,
    submitFailed,
  } = props;

  return (
    <form onSubmit={handleSubmit} id={formName}>
      <ProjectContentAdminForm {...props} />
      <ProjectStepFormAdmin form={formName} />
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
    </form>
  );
};

const mapStateToProps = (state, { project }: Props) => ({
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
        title
        type
      }
      opinionTerm
      ...ProjectContentAdminForm_project
    }
  `,
});
