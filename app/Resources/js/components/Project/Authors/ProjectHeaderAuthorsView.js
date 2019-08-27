// @flow
import moment from 'moment';
import * as React from 'react';
import { FormattedDate } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay';

import environment, { graphqlError } from '../../../createRelayEnvironment';
import type { Uuid } from '../../../types';
import type {
  ProjectHeaderAuthorsViewQueryResponse,
  ProjectHeaderAuthorsViewQueryVariables,
} from '~relay/ProjectHeaderAuthorsViewQuery.graphql';
import ProjectHeaderAuthors from './ProjectHeaderAuthors';

export type Props = {|
  projectId: Uuid,
|};

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
              ... on Project {
                publishedAt
              }
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
            <>
              {/* $FlowFixMe $refType */}
              <ProjectHeaderAuthors project={project} />
              <div className="mt-10">
                <i className="cap-calendar-2-1 mr-10" />
                <FormattedDate
                  value={moment(project.publishedAt)}
                  day="numeric"
                  month="long"
                  year="numeric"
                />
              </div>
            </>
          );
        }}
      />
    </React.Fragment>
  );
};

export default ProjectHeaderAuthorsView;
