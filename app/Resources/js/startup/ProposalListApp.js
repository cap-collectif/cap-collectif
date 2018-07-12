// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../createRelayEnvironment';
import ProposalList from '../components/Proposal/List/ProposalList';
import type { ProposalListAppQueryResponse } from './__generated__/ProposalListAppQuery.graphql';

export default ({ authorId, isAuthenticated }: { authorId: string, isAuthenticated: boolean }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        variables={{ authorId, isProfileView: true, isAuthenticated, stepId: '' }}
        environment={environment}
        query={graphql`
          query ProposalListAppQuery(
            $stepId: ID!
            $authorId: ID!
            $isProfileView: Boolean!
            $isAuthenticated: Boolean!
          ) {
            proposalForms {
              step {
                title
              }
              proposals(first: 50, author: $authorId) {
                ...ProposalList_proposals
                totalCount
              }
            }
            viewer @include(if: $isAuthenticated) {
              ...ProposalList_viewer
            }
          }
        `}
        render={({ error, props }: ReadyState & { props: ?ProposalListAppQueryResponse }) => {
          if (error) {
            return graphqlError;
          }
          if (props) {
            if (props.proposalForms) {
              return (
                <div>
                  {props.proposalForms.filter(p => p.proposals.totalCount > 0).map(proposalForm => (
                    <div>
                      <h3>{proposalForm.step.title}</h3>
                      <ProposalList
                        step={null}
                        proposals={proposalForm.proposals}
                        viewer={props.viewer || null}
                      />
                    </div>
                  ))}
                </div>
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
