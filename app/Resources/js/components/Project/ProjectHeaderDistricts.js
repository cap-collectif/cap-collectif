// @flow
import * as React from 'react';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';

import ProjectHeaderDistrictsList from './ProjectHeaderDistrictsList';
import environment, { graphqlError } from '../../createRelayEnvironment';
import type { Uuid } from '../../types';
import type { ProjectHeaderDistrictsQueryResponse } from './__generated__/ProjectHeaderDistrictsQuery.graphql';

type Props = {
  projectId: Uuid,
};

export const ProjectHeaderDistricts = (properties: Props) => {
  const { projectId } = properties;

  return (
    <React.Fragment>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProjectHeaderDistrictsQuery($projectId: ID!) {
            project: node(id: $projectId) {
              id
              ...ProjectHeaderDistrictsList_project
            }
          }
        `}
        variables={{
          projectId,
        }}
        render={({
          error,
          props,
        }: { props?: ?ProjectHeaderDistrictsQueryResponse } & ReadyState) => {
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
            <ProjectHeaderDistrictsList project={project} />
          );
        }}
      />
    </React.Fragment>
  );
};

export default ProjectHeaderDistricts;
