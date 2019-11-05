// @flow
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { createFragmentContainer, fetchQuery, graphql } from 'react-relay';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';
import AppDispatcher from '~/dispatchers/AppDispatcher';
import type { Dispatch } from '~/types';
import AlertForm from '~/components/Alert/AlertForm';
import { type ProjectMetadataAdminForm_project } from '~relay/ProjectMetadataAdminForm_project.graphql';
import component from '~/components/Form/Field';
import select from '~/components/Form/Select';
import environment from '~/createRelayEnvironment';
import UpdateProjectMutation from '~/mutations/UpdateProjectMutation';
import { UPDATE_ALERT } from '~/constants/AlertConstants';

type Props = {|
  ...ReduxFormFormProps,
  project: ?ProjectMetadataAdminForm_project,
  intl: IntlShape,
|};

type Option = {|
  value: string,
  label: string,
|};

type FormValues = {|
  publishedAt: string,
  themes: Option[],
  Cover: ?{
    id: string,
    description: ?string,
    name: ?string,
    size: ?string,
    url: ?string,
  },
  video: ?string,
  districts: Option[],
|};

const formatOption = (options: Option[]): string[] => options.map(option => option.value);

const getDistrictList = graphql`
  query ProjectMetadataAdminFormDistrictQuery($name: String) {
    projectDistricts(name: $name) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

const getThemeOptions = graphql`
  query ProjectMetadataAdminFormThemeQuery($title: String) {
    themes(title: $title) {
      id
      title
    }
  }
`;
const onSubmit = (
  { publishedAt, themes, Cover, video, districts }: FormValues,
  dispatch: Dispatch,
  { project }: Props,
) => {
  if (publishedAt && typeof publishedAt !== 'string' && !(publishedAt instanceof String)) {
    publishedAt = publishedAt.format('YYYY-MM-DD HH:mm:ss');
  }
  const input = {
    publishedAt,
    Cover: Cover ? Cover.id : null,
    video,
    districts: formatOption(districts),
    themes: formatOption(themes),
  };

  if (project && project.id) {
    return UpdateProjectMutation.commit({
      input: {
        id: project.id,
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
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  color: #000000;
  .published-at-container {
    width: 50%;
  }
`;

const VideoTextSpan = styled.span`
  display: block;
  margin-top: 5px;
  margin-bottom: 10px;
  color: #737373;
`;

const validate = ({ publishedAt }: FormValues) => {
  const errors = {};

  if (publishedAt === null) {
    errors.publishedAt = 'global.constraints.notBlank';
  }

  return errors;
};

const formName = 'project-metadata-admin-form';

export const ProjectMetadataAdminForm = (props: Props) => {
  const {
    handleSubmit,
    valid,
    invalid,
    submitting,
    pristine,
    submitSucceeded,
    submitFailed,
  } = props;

  const loadDistrictOptions = (search: ?string) => {
    return fetchQuery(environment, getDistrictList, {
      name: search,
    }).then(data => {
      return (
        data.projectDistricts.edges &&
        data.projectDistricts.edges
          .filter(d => d.node)
          .map(d => {
            if (d.node) {
              return { value: d.node.id, label: d.node.name };
            }
          })
      );
    });
  };

  const loadThemeOptions = (search: ?string) => {
    return fetchQuery(environment, getThemeOptions, {
      title: search,
    }).then(data => {
      return data.themes.map(u => ({
        value: u.id,
        label: u.title,
      }));
    });
  };

  return (
    <Wrapper>
      <form onSubmit={handleSubmit} id={formName}>
        <Field
          id="publishedAt"
          component={component}
          type="datetime"
          name="publishedAt"
          formName={formName}
          label={
            <div>
              <FormattedMessage id="admin.fields.project.published_at" />
              <span className="excerpt inline">
                <FormattedMessage id="global.mandatory" />
              </span>
            </div>
          }
          addonAfter={<i className="cap-calendar-2" />}
        />

        <Field
          selectFieldIsObject
          debounce
          autoload
          labelClassName="control-label"
          inputClassName="fake-inputClassName"
          component={select}
          id="themes"
          name="themes"
          placeholder={<FormattedMessage id="admin.fields.project.themes" />}
          label={<FormattedMessage id="admin.fields.project.themes" />}
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="true"
          loadOptions={loadThemeOptions}
          multi
          clearable
        />

        <div className="row mr-0 ml-0">
          <Field
            id="cover"
            name="Cover"
            component={component}
            type="image"
            image={null}
            label={<FormattedMessage id="proposal.media" />}
          />
        </div>

        <Field
          type="text"
          name="video"
          id="video"
          label={
            <span className="project-video">
              <FormattedMessage id="admin.fields.project.video" />
            </span>
          }
          component={component}
        />

        <VideoTextSpan className="mt-0 mb-15">
          <FormattedMessage id="admin.help.project.video" />
        </VideoTextSpan>

        <Field
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="true"
          loadOptions={loadDistrictOptions}
          component={select}
          id="districts"
          name="districts"
          clearable
          selectFieldIsObject
          debounce
          autoload
          multi
          labelClassName="control-label"
          inputClassName="fake-inputClassName"
          placeholder="Choisir un district"
          label={
            <div>
              <FormattedMessage id="proposal_form.districts" />
            </div>
          }
        />

        <Button
          id="submit-project-metadata"
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
    </Wrapper>
  );
};

const mapStateToProps = (state, { project }: Props) => ({
  initialValues: {
    themes: project
      ? project.themes &&
        project.themes.map(theme => {
          return theme;
        })
      : [],
    video: project ? project.video : null,
    Cover: project ? project.Cover : null,

    districts: project
      ? project &&
        project.districts &&
        project.districts.edges &&
        project.districts.edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(d => {
            return { value: d.value, label: d.label };
          })
      : [],
    publishedAt: project ? project.publishedAt : null,
  },
});

const form = injectIntl(
  reduxForm({
    validate,
    onSubmit,
    form: formName,
  })(ProjectMetadataAdminForm),
);

export const container = connect(mapStateToProps)(form);

export default createFragmentContainer(container, {
  project: graphql`
    fragment ProjectMetadataAdminForm_project on Project {
      id
      title
      publishedAt
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
    }
  `,
});
