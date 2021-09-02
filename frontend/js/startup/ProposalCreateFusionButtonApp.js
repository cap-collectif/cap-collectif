// @flow
import React, { lazy, Suspense } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Providers from './Providers';
import environment, { graphqlError } from '../createRelayEnvironment';
import type { Props } from '~/components/Proposal/Create/ProposalCreateFusionButton';
import { type ProposalCreateFusionButtonAppQueryResponse } from '~relay/ProposalCreateFusionButtonAppQuery.graphql';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProposalCreateFusionButton = lazy(() =>
  import(
    /* webpackChunkName: "ProposalCreateFusionButton" */ '~/components/Proposal/Create/ProposalCreateFusionButton'
  ),
);

export default (data: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProposalCreateFusionButtonAppQuery {
            ...ProposalFusionForm_query
          }
        `}
        variables={{}}
        render={({
          error,
          props,
        }: {
          ...ReactRelayReadyState,
          props: ?ProposalCreateFusionButtonAppQueryResponse,
        }) => {
          if (error) {
            return graphqlError;
          }
          if (props) {
            return <ProposalCreateFusionButton {...data} query={props} />;
          }
          return null;
        }}
      />
    </Providers>
  </Suspense>
);
