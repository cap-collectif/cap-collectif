// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProjectRestrictedAccessFragment from './ProjectRestrictedAccessFragment';
import type { ProjectRestrictedAccessQueryResponse } from '~relay/ProjectRestrictedAccessQuery.graphql';

const query = graphql`
  query ProjectRestrictedAccessQuery($projectId: ID!, $count: Int, $cursor: String) {
    project: node(id: $projectId) {
      ... on Project {
        ...ProjectRestrictedAccessFragment_project
      }
    }
  }
`;

type Props = {
  projectId: string,
  icon?: ?string,
};

export class ProjectRestrictedAccess extends React.Component<Props> {
  render() {
    const component = ({
      error,
      props,
    }: {
      props: ?ProjectRestrictedAccessQueryResponse,
      ...ReactRelayReadyState,
    }) => {
      if (error) {
        return graphqlError;
      }
      if (props) {
        if (props.project === null) {
          return null;
        }
        return <ProjectRestrictedAccessFragment project={props.project} />;
      }

      return null;
    };

    return (
      <div>
        <QueryRenderer
          environment={environment}
          query={query}
          variables={{
            projectId: this.props.projectId,
            count: 10,
            cursor: null,
          }}
          render={component}
        />
      </div>
    );
  }
}

export default ProjectRestrictedAccess;
