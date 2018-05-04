// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddProposalVoteMutationVariables,
  AddProposalVoteMutationResponse,
} from './__generated__/AddProposalVoteMutation.graphql';

const mutation = graphql`
  mutation AddProposalVoteMutation($input: AddProposalVoteInput!, $stepId: ID!) {
    addProposalVote(input: $input) {
      vote {
        id
        proposal {
          id
          ...ProposalVotes_proposal @arguments(stepId: $stepId)
          ...ProposalVoteButtonWrapperFragment_proposal @arguments(stepId: $stepId)
          ...ProposalPreviewFooter_proposal @arguments(stepId: $stepId)
          allVotes: votes(first: 0) {
            totalCount
          }
        }
      }
      viewer {
        ...ProposalVoteButtonWrapperFragment_viewer @arguments(stepId: $stepId)
        ...ProposalVoteBasketWidget_viewer @arguments(stepId: $stepId)
      }
    }
  }
`;

const commit = (
  variables: AddProposalVoteMutationVariables,
): Promise<AddProposalVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
