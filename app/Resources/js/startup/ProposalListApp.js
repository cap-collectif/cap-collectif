// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../createRelayEnvironment';
import ProposalList from '../components/Proposal/List/ProposalList';
import type { ProposalListAppQueryResponse } from './__generated__/ProposalListAppQuery.graphql';

export default () => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        variables={{ isProfileView: true, isAuthenticated: false, stepId: '' }}
        environment={environment}
        query={graphql`
          query ProposalListAppQuery(
            $stepId: ID!
            $isProfileView: Boolean!
            $isAuthenticated: Boolean!
          ) {
            proposalForms {
              step {
                title
              }
              proposals(first: 50, affiliations: [OWNER]) {
                ...ProposalList_proposals
                totalCount
              }
            }
            viewer {
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
                        viewer={props.viewer}
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
