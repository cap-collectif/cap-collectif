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
import type { ProjectListFiltersContainerQueryResponse } from './__generated__/ProjectListFiltersContainerQuery.graphql';
import type { GlobalState } from '../../../../types';
import config from '../../../../config';

export type ProjectType = {
  id: string,
  title: string,
  slug: string,
};

export type ProjectAuthor = {
  id: string,
  username: ?string,
};

export type ProjectTheme = { id: string, slug: string, title: string };

type Props = {
  dispatch: Function,
  intl: IntlShape,
  type: ?string,
  author: ?string,
  themes: ProjectTheme[],
  features: { themes: boolean },
  theme: ?string,
};
type State = {
  projectTypes: ProjectType[],
  projectAuthors: ProjectAuthor[],
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
      (data: ProjectListFiltersContainerQueryResponse) => {
        // $FlowFixMe
        this.setState({
          projectTypes: data.projectTypes,
        });
        // $FlowFixMe
        this.setState({
          projectAuthors: data.projectAuthors,
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
    const { intl, dispatch, themes, features } = this.props;
    if (projectTypes.length > 0 && projectAuthors.length > 0 && themes.length > 0) {
      return (
        <Col md={7}>
          <FiltersContainer
            type="project"
            overlay={
              <ProjectListFilters
                dispatch={dispatch}
                features={features}
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
      <Row className={config.isMobile ? 'mb-10 ml-0' : 'mb-10'}>
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
  features: state.default.features,
  themes: state.default.themes,
  author: selector(state, 'author'),
  theme: selector(state, 'theme'),
  type: selector(state, 'type'),
});

export default connect(mapStateToProps)(injectIntl(ProjectListFiltersContainer));
