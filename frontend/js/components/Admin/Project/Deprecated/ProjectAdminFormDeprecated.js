// @flow
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { Field, reduxForm } from 'redux-form';
import { graphql, createFragmentContainer } from 'react-relay';
import { injectIntl, type IntlShape, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import renderComponent from '../../../Form/Field';
import type { Dispatch, FeatureToggles } from '../../../../types';
import UserListField from '../../Field/UserListField';
import AppDispatcher from '../../../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../../../constants/AlertConstants';
import ProjectTypeListField from '../../Field/ProjectTypeListField';
import CreateProjectMutation from '../../../../mutations/CreateProjectMutation';
import UpdateProjectMutation from '../../../../mutations/UpdateProjectMutation';
import { type ProjectAdminFormDeprecated_project } from '~relay/ProjectAdminFormDeprecated_project.graphql';
import AlphaProjectModal from './AlphaProjectModal';
import { ProjectBoxContainer, BoxDeprecated } from '../Form/ProjectAdminForm.style';
import { Label } from '~/components/Ui/Labels/Label';

const formName = 'projectAdminFormDeprecated';

type Props = {|
  ...ReduxFormFormProps,
  project: ?ProjectAdminFormDeprecated_project,
  intl: IntlShape,
  formName: string,
  features: FeatureToggles,
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

/*
  This file is here to handle the retro-compatibility
  with the old project page, it will be removed once the
  react project page is complete.
*/
export const ProjectAdminFormDeprecated = (props: Props) => {
  const { handleSubmit, intl, invalid, submitting, pristine, project, features } = props;

  let noModal = window.location.href.indexOf('?back=alpha') !== -1;
  const isFirstTime = !localStorage.getItem(`projectForm_${project?._id || ''}`);
  if (!isFirstTime) {
    noModal = true;
  } else if (project) {
    localStorage.setItem(`projectForm_${project?._id}`, 'true');
  }
  const [showModal, setShowModal] = useState(!noModal);
  const [showTopInfo, setShowTopInfo] = useState(noModal);

  const { unstable__analysis } = features;
  return (
    <div className={project && 'col-md-12'}>
      {!!project && unstable__analysis && showTopInfo && (
        <ProjectBoxContainer className="box container-fluid" color="#007bff">
          <BoxDeprecated>
            <div>
              <Label color="#007bff" fontSize={12}>
                <FormattedMessage id="global.new" />
              </Label>
              <FormattedMessage id="title.discover.new.project.page" />
            </div>
            <a href={`/admin/alpha/project/${project?._id || ''}/edit`}>
              <FormattedMessage id="global.discover" /> <i className="cap cap-arrow-66" />
            </a>
          </BoxDeprecated>
          <FormattedHTMLMessage
            tagName="p"
            id="message.page.version.switch"
            values={{ date: '31/12/2020' }}
          />
        </ProjectBoxContainer>
      )}
      <AlphaProjectModal
        hasAnalysis={project?.hasAnalysis || false}
        show={!!unstable__analysis && showModal && !!project}
        onClose={() => {
          setShowModal(false);
          setShowTopInfo(true);
        }}
        id={project?._id || ''}
      />
      <div className={project && 'box box-primary container-fluid'}>
        {project && (
          <div className="box-header">
            <h4 className="box-title">
              <FormattedMessage id="admin.group.content" />
            </h4>
          </div>
        )}
        <div className="box-content">
          <form onSubmit={handleSubmit} id={formName}>
            <Field
              type="text"
              name="title"
              label={
                <div>
                  <FormattedMessage id="global.title" />
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
          </form>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state, { project }: Props) => ({
  features: state.default.features,
  initialValues: {
    opinionTerm: project ? project.opinionTerm : opinionTerms[0].id,
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
  })(ProjectAdminFormDeprecated),
);

export const container = connect(mapStateToProps)(form);

export default createFragmentContainer(container, {
  project: graphql`
    fragment ProjectAdminFormDeprecated_project on Project {
      id
      _id
      title
      hasAnalysis
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
