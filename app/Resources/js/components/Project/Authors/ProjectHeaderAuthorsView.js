// @flow
import * as React from 'react';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';

import environment, { graphqlError } from '../../../createRelayEnvironment';
import type { Uuid } from '../../../types';
import type {
  ProjectHeaderAuthorsViewQueryResponse,
  ProjectHeaderAuthorsViewQueryVariables,
} from '~relay/ProjectHeaderAuthorsViewQuery.graphql';
import ProjectHeaderAuthors from './ProjectHeaderAuthors';

export type Props = {
  projectId: Uuid,
};

export const ProjectHeaderAuthorsView = (properties: Props) => {
  const { projectId } = properties;

  return (
    <React.Fragment>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProjectHeaderAuthorsViewQuery($projectId: ID!) {
            project: node(id: $projectId) {
              ...ProjectHeaderAuthors_project
            }
          }
        `}
        variables={
          ({
            projectId,
          }: ProjectHeaderAuthorsViewQueryVariables)
        }
        render={({
          error,
          props,
        }: {|
          ...ReadyState,
          props: ?ProjectHeaderAuthorsViewQueryResponse,
        |}) => {
          if (error) {
            return graphqlError;
          }

          if (!props) {
            return null;
          }

          const { project } = props;

          if (!project) {
            return graphqlError;
          }

          return (
            /* $FlowFixMe $refType */
            <ProjectHeaderAuthors project={project} />
          );
        }}
      />
    </React.Fragment>
  );
};

export default ProjectHeaderAuthorsView;
