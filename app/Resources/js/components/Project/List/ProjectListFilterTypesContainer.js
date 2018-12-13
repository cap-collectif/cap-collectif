// @flow
import React from 'react';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';

import environment, { graphqlError } from '../../../createRelayEnvironment';
import type { ProjectListFilterTypesQueryResponse } from './__generated__/ProjectListFilterTypesContainerQuery.graphql';
import ProjectsListFilterTypes from './ProjectListFilterTypes';

type Props = {};

export default class ProjectsListFilterTypesContainer extends React.Component<Props> {
  renderProjectsListFilterTypes = ({
    error,
    props,
  }: {
    props: ?ProjectListFilterTypesQueryResponse,
  } & ReadyState) => {
    if (error) {
      console.log(error); // eslint-disable-line no-console
      return graphqlError;
    }
    if (props) {
      if (props.projectTypes) {
        const { projectTypes } = props;
        if (projectTypes.length > 0) {
          return <ProjectsListFilterTypes projectTypes={projectTypes} />;
        }
      }
    }
    return null;
  };

  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProjectListFilterTypesContainerQuery {
            projectTypes {
              id
              title
              slug
            }
          }
        `}
        variables={{}}
        render={this.renderProjectsListFilterTypes}
      />
    );
  }
}
