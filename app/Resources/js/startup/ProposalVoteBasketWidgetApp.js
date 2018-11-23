// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../createRelayEnvironment';
import ProposalVoteBasketWidget from '../components/Proposal/Vote/ProposalVoteBasketWidget';
import type {
  ProposalVoteBasketWidgetAppQueryResponse,
  ProposalVoteBasketWidgetAppQueryVariables,
} from './__generated__/ProposalVoteBasketWidgetAppQuery.graphql';

type Props = {
  stepId: string,
  votesPageUrl: string,
  image: string,
};

export default (data: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        variables={
          ({
            stepId: data.stepId,
          }: ProposalVoteBasketWidgetAppQueryVariables)
        }
        environment={environment}
        query={graphql`
          query ProposalVoteBasketWidgetAppQuery($stepId: ID!) {
            step: node(id: $stepId) {
              ...ProposalVoteBasketWidget_step
            }
            viewer {
              ...ProposalVoteBasketWidget_viewer @arguments(stepId: $stepId)
            }
          }
        `}
        render={({
          error,
          props,
        }: { props: ?ProposalVoteBasketWidgetAppQueryResponse } & ReadyState) => {
          if (error) {
            return graphqlError;
          }
          if (props) {
            if (props.step) {
              return (
                // $FlowFixMe
                <ProposalVoteBasketWidget
                  step={props.step}
                  viewer={props.viewer}
                  image={data.image}
                  votesPageUrl={data.votesPageUrl}
                />
              );
            }
            return graphqlError;
          }
          return null;
        }}
      />
    </IntlProvider>
  </Provider>
);
