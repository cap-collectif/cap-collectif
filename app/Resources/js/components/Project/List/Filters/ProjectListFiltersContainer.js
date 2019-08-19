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

export type ProjectDistrict = {|
  +id: string,
  +name: ?string,
|};

export type ProjectTheme = { id: string, slug: string, title: string };

type Props = {|
  +intl: IntlShape,
  +type: ?string,
  +author: ?string,
  +themes: ProjectTheme[],
  +theme: ?string,
  +district: ?string,
|};
type State = {|
  projectTypes: $PropertyType<ProjectListFiltersContainerQueryResponse, 'projectTypes'>,
  projectAuthors: $PropertyType<ProjectListFiltersContainerQueryResponse, 'projectAuthors'>,
  projectDistricts: $PropertyType<ProjectListFiltersContainerQueryResponse, 'projectDistricts'>,
|};

const getAvailableProjectResources = graphql`
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
    projectDistricts {
      totalCount
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export class ProjectListFiltersContainer extends React.Component<Props, State> {
  state = { projectTypes: [], projectAuthors: [], projectDistricts: { totalCount: 0, edges: [] } };

  componentDidMount() {
    fetchQuery(environment, getAvailableProjectResources, {}).then(
      ({
        projectTypes,
        projectAuthors,
        projectDistricts,
      }: ProjectListFiltersContainerQueryResponse) => {
        this.setState({
          projectTypes: projectTypes || [],
          projectAuthors: projectAuthors || [],
          projectDistricts: projectDistricts || [],
        });
      },
    );
  }

  countFilter(): number {
    const { type, author, theme, district } = this.props;
    return Number(!!author) + Number(!!type) + Number(!!theme) + Number(!!district);
  }

  renderFilters() {
    const { projectTypes, projectAuthors, projectDistricts } = this.state;
    const { intl, themes } = this.props;
    if (projectTypes.length > 0 || projectAuthors.length > 0 || themes.length > 0 || projectDistricts.totalCount  > 0) {
      return (
        <Col md={7} className={config.isMobile ? 'mt-10 mb-5' : ''}>
          <FiltersContainer
            type="project"
            overlay={
              <ProjectListFilters
                intl={intl}
                projectAuthors={projectAuthors}
                projectTypes={projectTypes}
                projectDistricts={projectDistricts}
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
  district: selector(state, 'district'),
});

export default connect(mapStateToProps)(injectIntl(ProjectListFiltersContainer));
