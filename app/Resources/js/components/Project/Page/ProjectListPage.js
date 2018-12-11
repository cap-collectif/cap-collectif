// @flow
import React from 'react';
import { Row } from 'react-bootstrap';
import ProjectList from '../List/ProjectsList';
import ProjectListFilter from '../List/ProjectListFilter';

type Props = {
  limit?: ?number,
};

export default class ProjectListPage extends React.Component<Props> {
  render() {
    const { limit } = this.props;
    return (
      <div>
        <ProjectListFilter />
        <Row>
          <ProjectList limit={limit} />
        </Row>
      </div>
    );
  }
}
