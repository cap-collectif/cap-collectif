// @flow
import React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProposalPageHeader from './ProposalPageHeader';
import ProposalPageAlert from './ProposalPageAlert';
import ProposalDraftAlert from './ProposalDraftAlert';
import ProposalPageTabs from './ProposalPageTabs';
import Loader from '../../Ui/Loader';
import type { FeatureToggles, State } from '../../../types';
import type { Proposal } from '../../../redux/modules/proposal';
import { PROPOSAL_FOLLOWERS_TO_SHOW } from '../../../constants/ProposalConstants';
import type ProposalPageQueryResponse from './__generated__/ProposalPageQuery.graphql';

type Props = {
  form: Object,
  proposal: Proposal,
  categories: Array<Object>,
  steps: Array<Object>,
  features: FeatureToggles,
  isAuthenticated: boolean,
};

export class ProposalPage extends React.Component<Props> {
  render() {
    const { proposal, steps, features, categories, form } = this.props;
    // $FlowFixMe
    return (
      <div>
        <ProposalDraftAlert proposal={proposal} />
        <ProposalPageAlert proposal={proposal} />

        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProposalPageQuery(
              $proposalId: ID!
              $count: Int!
              $cursor: String
              $isAuthenticated: Boolean!
            ) {
              proposal: node(id: $proposalId) {
                ...ProposalPageTabs_proposal
                ...ProposalPageHeader_proposal
              }
            }
          `}
          variables={{
            proposalId: proposal.id,
            count: PROPOSAL_FOLLOWERS_TO_SHOW,
            cursor: null,
            isAuthenticated: this.props.isAuthenticated,
          }}
          render={({ error, props }: { error: ?Error, props?: ProposalPageQueryResponse }) => {
            if (error) {
              console.log(error); // eslint-disable-line no-console
              return graphqlError;
            }
            if (props) {
              // eslint-disable-next-line react/prop-types
              if (props.proposal) {
                return (
                  <div>
                    <ProposalPageHeader
                      proposal={props.proposal}
                      oldProposal={proposal}
                      className="container container--custom"
                    />
                    <ProposalPageTabs
                      proposal={props.proposal}
                      oldProposal={proposal}
                      steps={steps}
                      features={features}
                      categories={categories}
                      form={form}
                    />
                  </div>
                );
              }

              return graphqlError;
            }
            return <Loader />;
          }}
        />
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => {
  return {
    isAuthenticated: state.user.user !== null,
    features: state.default.features,
    proposal:
      state.proposal.currentProposalId &&
      state.proposal.proposalsById[state.proposal.currentProposalId],
    steps:
      state.project.currentProjectById &&
      state.project.projectsById[state.project.currentProjectById].steps,
  };
};

export default connect(mapStateToProps)(ProposalPage);
