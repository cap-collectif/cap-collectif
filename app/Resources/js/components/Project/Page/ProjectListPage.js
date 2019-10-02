// @flow
import React from 'react';
import { Row } from 'react-bootstrap';
import ProjectList from '../List/ProjectsList';
import ProjectListFiltersContainer from '../List/Filters/ProjectListFiltersContainer';

export type Props = {
  limit?: ?number,
};

export default class ProjectListPage extends React.Component<Props> {
  render() {
    const { limit } = this.props;
    return (
      <div>
        <ProjectListFiltersContainer />
        <Row id="project-list">
          {/* $FlowFixMe defaultProps not working */}
          <ProjectList limit={limit} />
        </Row>
      </div>
    );
  }
}
