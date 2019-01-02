// @flow
import React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProposalPageHeader from './ProposalPageHeader';
import ProposalPageAlert from './ProposalPageAlert';
import ProposalDraftAlert from './ProposalDraftAlert';
import ProposalPageTabs from './ProposalPageTabs';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type { Uuid, FeatureToggles, State } from '../../../types';
import { PROPOSAL_FOLLOWERS_TO_SHOW } from '../../../constants/ProposalConstants';
import type ProposalPageQueryResponse from './__generated__/ProposalPageQuery.graphql';

type Props = {
  // form: Object,
  proposalId: Uuid,
  currentVotableStepId: ?Uuid,
  features: FeatureToggles,
  isAuthenticated: boolean,
};

export class ProposalPage extends React.Component<Props> {
  render() {
    const { proposalId, features } = this.props;
    return (
      <div>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProposalPageQuery(
              $proposalId: ID!
              $hasVotableStep: Boolean!
              $stepId: ID!
              $count: Int!
              $cursor: String
              $isAuthenticated: Boolean!
            ) {
              viewer @include(if: $isAuthenticated) {
                ...ProposalPageTabs_viewer
                ...ProposalPageHeader_viewer @arguments(hasVotableStep: $hasVotableStep)
              }
              step: node(id: $stepId) @include(if: $hasVotableStep) {
                ...ProposalPageHeader_step @arguments(isAuthenticated: $isAuthenticated)
                ...ProposalPageTabs_step
              }
              proposal: node(id: $proposalId) {
                ...ProposalDraftAlert_proposal
                ...ProposalPageAlert_proposal
                ...ProposalPageTabs_proposal
                ...ProposalPageHeader_proposal @arguments(isAuthenticated: $isAuthenticated)
              }
              proposalForm: node(id: $proposalId) {
                ...ProposalPageTabs_proposalForm
              }
            }
          `}
          variables={{
            proposalId,
            hasVotableStep: !!this.props.currentVotableStepId,
            stepId: this.props.currentVotableStepId || '',
            count: PROPOSAL_FOLLOWERS_TO_SHOW,
            cursor: null,
            isAuthenticated: this.props.isAuthenticated,
          }}
          render={({ error, props }: { props?: ProposalPageQueryResponse } & ReadyState) => {
            if (error) {
              console.log(error); // eslint-disable-line no-console
              return graphqlError;
            }
            if (props) {
              // eslint-disable-next-line react/prop-types
              if (props.proposal) {
                return (
                  <div>
                    <ProposalDraftAlert proposal={props.proposal} />
                    <ProposalPageAlert proposal={props.proposal} />
                    <section className="section--custom">
                      <ProposalPageHeader
                        proposal={props.proposal}
                        step={props.step || null}
                        viewer={props.viewer || null}
                        isAuthenticated={!!props.viewer}
                        className="container"
                      />
                    </section>
                    <section className="section--custom">
                      <ProposalPageTabs
                        proposal={props.proposal}
                        step={props.step || null}
                        viewer={props.viewer || null}
                        features={features}
                        form={props.proposalForm}
                      />
                    </section>
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

const mapStateToProps = (state: State) => ({
  isAuthenticated: state.user.user !== null,
  features: state.default.features,
});

export default connect(mapStateToProps)(ProposalPage);
