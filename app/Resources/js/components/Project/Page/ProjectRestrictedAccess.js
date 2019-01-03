// @flow
import React from 'react';
import { type ReadyState, QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import RenderCustomAccess from './RenderCustomAccess';
import RenderPrivateAccess from './RenderPrivateAccess';
import type { ProjectRestrictedAccessQueryResponse } from './__generated__/ProjectRestrictedAccessQuery.graphql';

const query = graphql`
  query ProjectRestrictedAccessQuery($projectId: ID!, $count: Int, $cursor: String) {
    project: node(id: $projectId) {
      ... on Project {
        visibility
        ...RenderCustomAccess_project
        ...RenderPrivateAccess_project
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
    }: { props: ?ProjectRestrictedAccessQueryResponse } & ReadyState) => {
      if (error) {
        return graphqlError;
      }
      if (props) {
        if (props.project === null) {
          return null;
        }

        // eslint-disable-next-line
        if (props.project && props.project.visibility) {
          if (props.project.visibility === 'CUSTOM') {
            return (
              <div id="restricted-access">
                <React.Fragment>
                  {/* $FlowFixMe */}
                  <RenderCustomAccess project={props.project} lockIcon={this.props.icon} />
                </React.Fragment>
              </div>
            );
          }
          if (props.project.visibility === 'ME' || props.project.visibility === 'ADMIN') {
            return (
              <div id="restricted-access">
                <React.Fragment>
                  {/* $FlowFixMe */}
                  <RenderPrivateAccess project={props.project} lockIcon={this.props.icon} />
                </React.Fragment>
              </div>
            );
          }
          return null;
        }
        return graphqlError;
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
