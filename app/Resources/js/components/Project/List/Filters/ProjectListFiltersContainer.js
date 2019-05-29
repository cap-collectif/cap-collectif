// @flow
import * as React from 'react';
import { injectIntl, type IntlShape } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { fetchQuery, graphql } from 'react-relay';

import ProjectListFilters, { selector } from './ProjectListFilters';
import ProjectListFilterOrder from './ProjectListFilterOrder';
import FiltersContainer from '../../../Filters/FiltersContainer';
import ProjectListSearch from '../ProjectListSearch';
import environment from '../../../../createRelayEnvironment';
import type { ProjectListFiltersContainerQueryResponse } from '~relay/ProjectListFiltersContainerQuery.graphql';
import type { GlobalState } from '../../../../types';
import config from '../../../../config';

export type ProjectType = {
  +id: string,
  +title: string,
  +slug: string,
};

export type ProjectAuthor = {
  +id: string,
  +username: ?string,
};

export type ProjectTheme = { id: string, slug: string, title: string };

type Props = {
  intl: IntlShape,
  type: ?string,
  author: ?string,
  themes: ProjectTheme[],
  theme: ?string,
};
type State = {
  projectTypes: $ReadOnlyArray<ProjectType>,
  projectAuthors: $ReadOnlyArray<ProjectAuthor>,
};

const getAvailableProjectTypesAndAuthors = graphql`
  query ProjectListFiltersContainerQuery {
    projectTypes {
      id
      title
      slug
    }
    projectAuthors {
      id
      username
    }
  }
`;

class ProjectListFiltersContainer extends React.Component<Props, State> {
  state = { projectTypes: [], projectAuthors: [] };

  componentDidMount() {
    fetchQuery(environment, getAvailableProjectTypesAndAuthors, {}).then(
      ({ projectTypes, projectAuthors }: ProjectListFiltersContainerQueryResponse) => {
        this.setState({
          projectTypes: projectTypes || [],
          projectAuthors: projectAuthors || [],
        });
      },
    );
  }

  countFilter(): number {
    const { type, author, theme } = this.props;
    return Number(!!author) + Number(!!type) + Number(!!theme);
  }

  renderFilters() {
    const { projectTypes, projectAuthors } = this.state;
    const { intl, themes } = this.props;
    if (projectTypes.length > 0 && projectAuthors.length > 0 && themes.length > 0) {
      return (
        <Col md={7} className={config.isMobile ? 'mt-10 mb-5' : ''}>
          <FiltersContainer
            type="project"
            overlay={
              <ProjectListFilters
                intl={intl}
                projectAuthors={projectAuthors}
                projectTypes={projectTypes}
                themes={themes}
              />
            }
            filterCount={this.countFilter()}
          />
        </Col>
      );
    }
    return null;
  }

  render() {
    return (
      <Row>
        <Col md={2}>
          {/* $FlowFixMe */}
          <ProjectListFilterOrder />
        </Col>
        {this.renderFilters()}
        <Col md={3} smHidden xsHidden>
          <ProjectListSearch />
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  themes: state.default.themes,
  author: selector(state, 'author'),
  theme: selector(state, 'theme'),
  type: selector(state, 'type'),
});

export default connect(mapStateToProps)(injectIntl(ProjectListFiltersContainer));
