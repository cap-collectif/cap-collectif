// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { type FormProps, reduxForm, Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';

import AlertForm from '../../Alert/AlertForm';
import renderComponent from '../../Form/Field';
import type { Dispatch } from '../../../types';
import UserListField from '../Field/UserListField';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import ProjectTypeListField from '../Field/ProjectTypeListField';
import { UPDATE_ALERT } from '../../../constants/AlertConstants';
import CreateProjectMutation from '../../../mutations/CreateProjectMutation';
import UpdateProjectMutation from '../../../mutations/UpdateProjectMutation';
import { type ProjectContentAdminForm_project } from '~relay/ProjectContentAdminForm_project.graphql';

type Props = {|
  ...FormProps,
  project: ?ProjectContentAdminForm_project,
  handleSubmit: () => void,
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
  opinionTerm: string,
  projectType: string,
|};

const projectTerms = [
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

const validate = ({ title, authors, opinionTerm, projectType }: FormValues) => {
  const errors = {};

  if (!title || title.length < 2) {
    errors.title = 'global.required';
  }

  if (!authors || authors.length <= 0) {
    errors.authors = 'global.required';
  }

  if (!projectType) {
    errors.projectType = 'global.required';
  }

  if (!opinionTerm) {
    errors.opinionTerm = 'global.required';
  }

  return errors;
};

const formName = 'projectAdminForm';

export const ProjectContentAdminForm = (props: Props) => {
  const {
    handleSubmit,
    intl,
    valid,
    invalid,
    submitting,
    pristine,
    submitSucceeded,
    submitFailed,
  } = props;

  return (
    <form onSubmit={handleSubmit} id={formName}>
      <Field
        type="text"
        name="title"
        label={<FormattedMessage id="admin.fields.group.title" />}
        component={renderComponent}
      />
      <UserListField
        id="project-author"
        name="authors"
        clearable
        selectFieldIsObject
        debounce
        autoload={false}
        multi
        labelClassName="control-label"
        inputClassName="fake-inputClassName"
        placeholder={intl.formatMessage({ id: 'all-the-authors' })}
        label={intl.formatMessage({ id: 'admin.fields.project.authors' })}
        ariaControls="EventListFilters-filter-author-listbox"
      />

      <ProjectTypeListField />
      <Field
        name="opinionTerm"
        type="select"
        component={renderComponent}
        initialValue={projectTerms[0].id}
        label={
          <span>
            <FormattedMessage id="admin.fields.project.opinion_term" />
          </span>
        }>
        {projectTerms.map(projectTerm => (
          <option key={projectTerm.id} value={projectTerm.id}>
            {intl.formatMessage({ id: projectTerm.label })}
          </option>
        ))}
      </Field>
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
    opinionTerm: project ? project.opinionTerm : projectTerms[0].id,
    authors: project ? project.authors : [],
    title: project ? project.title : null,
    projectType: project && project.type ? project.type.id : null,
  },
});

const form = injectIntl(
  reduxForm({
    validate,
    onSubmit,
    form: formName,
  })(ProjectContentAdminForm),
);

export const container = connect(mapStateToProps)(form);

export default createFragmentContainer(container, {
  project: graphql`
    fragment ProjectContentAdminForm_project on Project {
      id
      title
      authors {
        value: id
        label: username
      }
      opinionTerm
      type {
        id
      }
    }
  `,
});
