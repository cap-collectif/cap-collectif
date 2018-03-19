// @flow
import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import environnement from '../createRelayEnvironment';
import type {
  UnfollowProposalMutationVariables,
  UnfollowProposalMutationResponse,
} from './__generated__/UnfollowProposalMutation.graphql';

const mutation = graphql`
  mutation UnfollowProposalMutation($input: UnfollowProposalInput!, $isAuthenticated: Boolean!) {
    unfollowProposal(input: $input) {
      proposal {
        ...ProposalFollowButton_proposal
        followerConnection {
          totalCount
        }
      }
      unfollowerId
    }
  }
`;

const commit = (
  variables: UnfollowProposalMutationVariables,
): Promise<UnfollowProposalMutationResponse> =>
  commitMutation(environnement, {
    mutation,
    variables,
    // TODO update in real type @spyl
    // configs: [
    //   {
    //     type: 'RANGE_DELETE',
    //     parentID: variables.input.proposalId,
    //     connectionKeys: [
    //       {
    //         key: 'ProposalPageFollowers_followerConnection',
    //       },
    //     ],
    //     pathToConnection: ['proposal', 'followerConnection'],
    //     deletedIDFieldName: 'unfollowerId',
    //   },
    // ],
  });

export default { commit };
