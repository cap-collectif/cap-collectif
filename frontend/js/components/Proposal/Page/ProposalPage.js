// @flow
import React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '~/createRelayEnvironment';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type { State } from '~/types';
import { PROPOSAL_FOLLOWERS_TO_SHOW } from '~/constants/ProposalConstants';
import type { ProposalPageQueryResponse } from '~relay/ProposalPageQuery.graphql';
import ProposalPageLogic from './ProposalPageLogic';

export type Props = {|
  proposalId: string,
  currentVotableStepId: ?string,
  isAuthenticated: boolean,
|};

export class ProposalPage extends React.Component<Props> {
  render() {
    const { proposalId, currentVotableStepId, isAuthenticated } = this.props;
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
              ...ProposalPageLogic_query
                @arguments(
                  proposalId: $proposalId
                  hasVotableStep: $hasVotableStep
                  stepId: $stepId
                  count: $count
                  cursor: $cursor
                  isAuthenticated: $isAuthenticated
                )
            }
          `}
          variables={{
            proposalId,
            hasVotableStep: !!currentVotableStepId,
            stepId: currentVotableStepId || '',
            count: PROPOSAL_FOLLOWERS_TO_SHOW,
            cursor: null,
            isAuthenticated,
          }}
          render={({
            error,
            props,
          }: {
            ...ReactRelayReadyState,
            props: ?ProposalPageQueryResponse,
          }) => {
            if (error) {
              console.log(error); // eslint-disable-line no-console
              return graphqlError;
            }
            if (props) {
              return <ProposalPageLogic query={props} />;
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
});

export default connect(mapStateToProps)(ProposalPage);
