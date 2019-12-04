// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../createRelayEnvironment';
import IntlProvider from './IntlProvider';
import ProposalCreateFusionButton, {
  type Props,
} from '../components/Proposal/Create/ProposalCreateFusionButton';
import { type ProposalCreateFusionButtonAppQueryResponse } from '~relay/ProposalCreateFusionButtonAppQuery.graphql';

export default (data: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
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
    </IntlProvider>
  </Provider>
);
