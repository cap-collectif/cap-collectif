// @flow
import React from 'react';
import { Row } from 'react-bootstrap';
import ProjectList from '../List/ProjectsList';
import ProjectListFilter from '../List/ProjectListFilter';

type Props = {};

export default class ProjectListPage extends React.Component<Props> {
  render() {
    return (
      <div>
        <ProjectListFilter />
        <Row>
          <ProjectList />
        </Row>
      </div>
    );
  }
}
