// @flow
import React, { lazy, Suspense } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Providers from './Providers';
import environment, { graphqlError } from '../createRelayEnvironment';
import { type ProjectStepTabsAppQueryResponse } from '~relay/ProjectStepTabsAppQuery.graphql';
import type { Props } from '~/components/Project/ProjectStepTabs';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProjectStepTabs = lazy(() => import('~/components/Project/ProjectStepTabs'));

const ProjectStepTabsAppRender = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?ProjectStepTabsAppQueryResponse,
}) => {
  if (error) {
    return graphqlError;
  }
  if (props) {
    return <ProjectStepTabs {...props} />;
  }
  return null;
};

export default ({ projectId }: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProjectStepTabsAppQuery($projectId: ID!) {
            project: node(id: $projectId) {
              ... on Project {
                ...ProjectStepTabs_project
              }
            }
          }
        `}
        variables={{ projectId }}
        render={ProjectStepTabsAppRender}
      />
    </Providers>
  </Suspense>
);
