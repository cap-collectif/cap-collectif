// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../createRelayEnvironment';
import Providers from './Providers';
import type { ProjectHeaderAppQueryResponse } from '~relay/ProjectHeaderAppQuery.graphql';
import type { Uuid } from '../types';
import ProjectHeader from '~/components/Project/ProjectHeader';
import ProjectHeaderLegacy from '~/components/Project/ProjectHeaderLegacy';
import Skeleton from '~ds/Skeleton';
import ProjectHeaderPlaceholder from '~/components/Project/ProjectHeader-Placeholder';
import ProjectHeaderPlaceholderLegacy from '~/components/Project/ProjectHeader-PlaceholderLegacy';

const query = graphql`
  query ProjectHeaderAppQuery($projectId: ID!, $count: Int, $cursor: String) {
    project: node(id: $projectId) {
      ...ProjectHeader_project @arguments(count: $count, cursor: $cursor)
      ...ProjectHeaderLegacy_project @arguments(count: $count, cursor: $cursor)
    }
  }
`;
export type Props = {|
  +projectId: Uuid,
  +currentStepType: string
|};
export default ({ projectId, currentStepType }: Props) => {

  const DSReadySteps = ['collect', 'selection'];
  const isDsReady = DSReadySteps.includes(currentStepType);

  return (
    <Providers resetCSS={!isDsReady} designSystem={isDsReady}>
      <QueryRenderer
        variables={{
          projectId,
          count: 10,
          cursor: null,
        }}
        environment={environment}
        query={query}
        render={({
                   error,
                   props,
                   retry,
                 }: {
          ...ReactRelayReadyState,
          props: ?ProjectHeaderAppQueryResponse,
        }) => {
          if (error) {
            return graphqlError;
          }
          if (props && !props.project) {
            console.error('Could not load the project');
            return null;
          }

          const getProjectHeader = () => {
            if (props && props.project) {
              return isDsReady ? <ProjectHeader project={props.project} /> : <ProjectHeaderLegacy project={props.project} />;
            }
            return null;
          }

          const getPlaceholder = () => {
            return isDsReady ? <ProjectHeaderPlaceholder fetchData={retry} hasError={!!error} /> : <ProjectHeaderPlaceholderLegacy fetchData={retry} hasError={!!error} />
          }

          return (
            <Skeleton
              isLoaded={!!(props && props.project)}
              placeholder={getPlaceholder()}>
              {!!(props && props.project) && getProjectHeader()}
            </Skeleton>
          );
        }}
      />
    </Providers>
  )
}
