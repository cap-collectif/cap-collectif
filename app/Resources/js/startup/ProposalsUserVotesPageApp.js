// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { QueryRenderer, graphql } from 'react-relay';
import IntlProvider from './IntlProvider';
import ProposalsUserVotesPage from '../components/Project/Votes/ProposalsUserVotesPage';
import environment, { graphqlError } from '../createRelayEnvironment';
import type {
  ProposalsUserVotesPageAppQueryResponse,
  ProposalsUserVotesPageAppQueryVariables,
} from '~relay/ProposalsUserVotesPageAppQuery.graphql';

const mainNode = (data: { projectId: string }) => {
  const store = ReactOnRails.getStore('appStore');

  return (
    <Provider store={store}>
      <IntlProvider>
        <QueryRenderer
          variables={
            ({
              project: data.projectId,
              isAuthenticated: true,
            }: ProposalsUserVotesPageAppQueryVariables)
          }
          environment={environment}
          query={graphql`
            query ProposalsUserVotesPageAppQuery($project: ID!, $isAuthenticated: Boolean!) {
              project: node(id: $project) {
                ...ProposalsUserVotesPage_project
              }
            }
          `}
          render={({
            error,
            props,
          }: {
            props: ?ProposalsUserVotesPageAppQueryResponse,
            ...ReadyState,
          }) => {
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
