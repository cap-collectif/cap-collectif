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
  projectId: string,
  votesPageUrl: string,
  image: string,
};

export default (data: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        variables={
          ({
            project: data.projectId,
            withVotes: false,
          }: ProposalVoteBasketWidgetAppQueryVariables)
        }
        environment={environment}
        query={graphql`
          query ProposalVoteBasketWidgetAppQuery($project: ID!, $withVotes: Boolean!) {
            project: node(id: $project) {
              ...ProposalVoteBasketWidget_project
            }
            viewer {
              ...ProposalVoteBasketWidget_viewer @arguments(withVotes: $withVotes)
            }
          }
        `}
        render={({
          error,
          props,
        }: ReadyState & { props: ?ProposalVoteBasketWidgetAppQueryResponse }) => {
          if (error) {
            return graphqlError;
          }
          if (props) {
            if (props.project) {
              return (
                // $FlowFixMe
                <ProposalVoteBasketWidget
                  project={props.project}
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
