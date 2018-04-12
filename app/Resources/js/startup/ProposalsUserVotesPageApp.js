// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import ProposalsUserVotesPage from '../components/Project/Votes/ProposalsUserVotesPage';
import environment, { graphqlError } from '../createRelayEnvironment';
import type {
  ProposalsUserVotesPageAppQueryResponse,
  ProposalsUserVotesPageAppQueryVariables,
} from './__generated__/ProposalsUserVotesPageAppQuery.graphql';

const mainNode = (data: { projectId: string }) => {
  const store = ReactOnRails.getStore('appStore');

  return (
    <Provider store={store}>
      <IntlProvider>
        <QueryRenderer
          variables={
            ({
              project: data.projectId,
            }: ProposalsUserVotesPageAppQueryVariables)
          }
          environment={environment}
          query={graphql`
            query ProposalsUserVotesPageAppQuery($project: ID!) {
              project: node(id: $project) {
                ...ProposalsUserVotesPage_project
              }
            }
          `}
          render={({
            error,
            props,
          }: ReadyState & { props: ?ProposalsUserVotesPageAppQueryResponse }) => {
            if (error) {
              return graphqlError;
            }
            if (props) {
              if (props.project) {
                return (
                  // $FlowFixMe
                  <ProposalsUserVotesPage project={props.project} />
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
};

export default mainNode;
