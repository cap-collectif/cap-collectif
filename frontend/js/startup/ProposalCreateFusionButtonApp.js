// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Providers from './Providers';
import environment, { graphqlError } from '../createRelayEnvironment';
import ProposalCreateFusionButton, {
  type Props,
} from '../components/Proposal/Create/ProposalCreateFusionButton';
import { type ProposalCreateFusionButtonAppQueryResponse } from '~relay/ProposalCreateFusionButtonAppQuery.graphql';

export default (data: Props) => (
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
);
