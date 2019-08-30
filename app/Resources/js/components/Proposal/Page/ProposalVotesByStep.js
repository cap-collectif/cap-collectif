// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProposalVotes from './ProposalVotes';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type {
  ProposalVotesByStepQueryResponse,
  ProposalVotesByStepQueryVariables,
} from '~relay/ProposalVotesByStepQuery.graphql';

type Props = {
  proposal: { +id: string },
  stepId: string,
};

export class ProposalVotesByStep extends React.Component<Props> {
  render() {
    const { proposal, stepId } = this.props;
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProposalVotesByStepQuery($proposalId: ID!, $stepId: ID!) {
            proposal: node(id: $proposalId) {
              ...ProposalVotes_proposal @arguments(stepId: $stepId)
            }
          }
        `}
        variables={
          ({
            proposalId: proposal.id,
            stepId,
          }: ProposalVotesByStepQueryVariables)
        }
        render={({
          error,
          props,
        }: {
          props: ?ProposalVotesByStepQueryResponse,
          ...ReactRelayReadyState,
        }) => {
          if (error) {
            console.log(error); // eslint-disable-line no-console
            return graphqlError;
          }
          if (props) {
            if (props.proposal) {
              return <ProposalVotes proposal={props.proposal} stepId={stepId} />;
            }

            return graphqlError;
          }
          return <Loader />;
        }}
      />
    );
  }
}

export default ProposalVotesByStep;
