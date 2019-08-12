// @flow
import React from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { type IntlShape } from 'react-intl';

import type { GlobalState, FeatureToggles } from '../../../../types';
import ProjectsListFilterTypes from './ProjectListFilterTypes';
import ProjectsListFilterAuthors from './ProjectListFilterAuthors';
import ProjectsListFilterThemes from './ProjectListFilterThemes';
import ProjectsListFilterStatus from './ProjectListFilterStatus';
import ProjectsListFilterDistricts from './ProjectListFilterDistricts';
import type { ProjectType, ProjectAuthor, ProjectTheme } from './ProjectListFiltersContainer';
import type { ProjectListFiltersContainerQueryResponse } from '~relay/ProjectListFiltersContainerQuery.graphql';

type Props = {
  author: ?string,
  features: FeatureToggles,
  intl: IntlShape,
  projectTypes: ProjectType[],
  projectAuthors: ProjectAuthor[],
  projectDistricts: $PropertyType<ProjectListFiltersContainerQueryResponse, 'projectDistricts'>,
  district: ?string,
  theme: ?string,
  status: ?string,
  themes: ProjectTheme[],
};

class ProjectListFilters extends React.Component<Props> {
  renderTypeFilter() {
    const { projectTypes } = this.props;
    return <ProjectsListFilterTypes projectTypes={projectTypes} />;
  }

  renderAuthorsFilter() {
    const { intl, projectAuthors, author } = this.props;
    return <ProjectsListFilterAuthors authors={projectAuthors} intl={intl} author={author} />;
  }

  renderThemeFilter() {
    const { features, themes, theme, intl } = this.props;
    if (features.themes) {
      return <ProjectsListFilterThemes themes={themes} intl={intl} theme={theme} />;
    }
  }

  renderThemeStatus() {
    const { status, intl } = this.props;
    return <ProjectsListFilterStatus intl={intl} status={status} />;
  }

  renderDistrictsFilter() {
    const { district, projectDistricts, intl } = this.props;
    return (
      <ProjectsListFilterDistricts
        district={district}
        projectDistricts={projectDistricts}
        intl={intl}
      />
    );
  }

  render() {
    const filters = [];
    filters.push(this.renderTypeFilter());
    filters.push(this.renderThemeFilter());
    filters.push(this.renderAuthorsFilter());
    filters.push(this.renderThemeStatus());
    filters.push(this.renderDistrictsFilter());

    if (filters.filter(Boolean).length > 0) {
      return (
        <form>
          {filters.map((filter, index) => (
            <Col key={index} className="mt-5">
              <div>{filter}</div>
            </Col>
          ))}
        </form>
      );
    }
    return null;
  }
}

const formName = 'ProjectListFilters';
export const selector = formValueSelector(formName);

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
  author: selector(state, 'author'),
  theme: selector(state, 'theme'),
  type: selector(state, 'type'),
  status: selector(state, 'status'),
  district: selector(state, 'district'),
});

type FormValues = {|
  +author: ?string,
  +theme: ?string,
  +type: ?string,
  +status: ?string,
  +district: ?string,
|};

export const getInitialValues = (): FormValues => {
  const urlSearch = new URLSearchParams(window.location.search);
  return {
    status: urlSearch.get('status') || null,
    type: urlSearch.get('type') || null,
    author: urlSearch.get('author') || null,
    theme: urlSearch.get('theme') || null,
    district: urlSearch.get('district') || null,
  };
};

const form = reduxForm({
  form: formName,
  destroyOnUnmount: false,
  initialValues: getInitialValues(),
})(ProjectListFilters);

export default connect(mapStateToProps)(form);
