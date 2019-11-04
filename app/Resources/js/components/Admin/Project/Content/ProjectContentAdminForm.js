// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { type IntlShape, FormattedMessage } from 'react-intl';

import renderComponent from '../../../Form/Field';
import UserListField from '../../Field/UserListField';
import { type Author } from '../Form/ProjectAdminForm';
import ProjectTypeListField from '../../Field/ProjectTypeListField';
import { type ProjectContentAdminForm_project } from '~relay/ProjectContentAdminForm_project.graphql';

export type FormValues = {|
  title: string,
  authors: Author[],
  opinionTerm: number,
  projectType: string,
|};

type Props = {|
  ...ReduxFormFormProps,
  project: ?ProjectContentAdminForm_project,
  intl: IntlShape,
  formName: string,
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

const convertOpinionTerm = (opinionTerm: string): number => parseInt(opinionTerm, 10);

const formName = 'projectAdminForm';

export const ProjectContentAdminForm = (props: Props) => {
  const { handleSubmit, intl } = props;

  return (
    <div className="col-md-12">
      <div className="box box-primary container-fluid">
        <div className="box-header">
          <h4 className="box-title">
            <FormattedMessage id="admin.group.content" />
          </h4>
        </div>
        <div className="box-content">
          <form onSubmit={handleSubmit} id={formName}>
            <Field
              type="text"
              name="title"
              label={
                <div>
                  <FormattedMessage id="admin.fields.group.title" />
                  <span className="excerpt">
                    <FormattedMessage id="global.mandatory" />
                  </span>
                </div>
              }
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
              label={
                <div>
                  <FormattedMessage id="admin.fields.project.authors" />
                  <span className="excerpt">
                    <FormattedMessage id="global.mandatory" />
                  </span>
                </div>
              }
              ariaControls="EventListFilters-filter-author-listbox"
            />

            <ProjectTypeListField />
            <Field
              name="opinionTerm"
              type="select"
              component={renderComponent}
              parse={convertOpinionTerm}
              normalize={convertOpinionTerm}
              label={
                <span>
                  <FormattedMessage id="admin.fields.project.opinion_term" />
                </span>
              }>
              {opinionTerms.map(projectTerm => (
                <option key={projectTerm.id} value={projectTerm.id}>
                  {intl.formatMessage({ id: projectTerm.label })}
                </option>
              ))}
            </Field>
          </form>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state, { project }: Props) => ({
  initialValues: {
    opinionTerm: project ? project.opinionTerm : opinionTerms[0].id,
    authors: project ? project.authors : [],
    title: project ? project.title : null,
    projectType: project && project.type ? project.type.id : null,
  },
});

export const container = connect(mapStateToProps)(ProjectContentAdminForm);

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
