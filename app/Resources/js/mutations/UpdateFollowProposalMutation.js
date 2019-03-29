// @flow
import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import environnement from '../createRelayEnvironment';
import type {
  UpdateFollowProposalMutationVariables,
  UpdateFollowProposalMutationResponse as Response,
} from '~relay/FollowProposalMutation.graphql';

const mutation = graphql`
  mutation UpdateFollowProposalMutation($input: UpdateFollowProposalInput!) {
    updateFollowProposal(input: $input) {
      proposal {
        id
        ...ProposalFollowButton_proposal
        followers {
          totalCount
        }
      }
      followerEdge {
        node {
          id
          url
          displayName
          username
          media {
            url
          }
        }
        cursor
      }
    }
  }
`;

const commit = (variables: UpdateFollowProposalMutationVariables): Promise<Response> =>
  commitMutation(environnement, {
    mutation,
    variables,
  });

export default { commit };
