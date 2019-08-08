// @flow
import * as React from 'react';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';

import ProjectHeaderDistrictsList from './ProjectHeaderDistrictsList';
import environment, { graphqlError } from '../../createRelayEnvironment';
import type { Uuid } from '../../types';
import type { ProjectHeaderDistrictsQueryResponse } from '~relay/ProjectHeaderDistrictsQuery.graphql';

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
            <>
              <i className="cap-marker-1 mr-10" />
              <ProjectHeaderDistrictsList project={project} fontSize={16} breakingNumber={3} />
            </>
          );
        }}
      />
    </React.Fragment>
  );
};

export default ProjectHeaderDistricts;
