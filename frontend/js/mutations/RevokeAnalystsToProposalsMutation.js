// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RevokeAnalystsToProposalsMutationVariables,
  RevokeAnalystsToProposalsMutationResponse as Response,
} from '~relay/RevokeAnalystsToProposalsMutation.graphql';

const mutation = graphql`
  mutation RevokeAnalystsToProposalsMutation($input: RevokeAnalystsToProposalsInput!) {
    revokeAnalystsToProposals(input: $input) {
      errorCode
      proposals {
        edges {
          node {
            id
            ...AnalysisProposalListRole_proposal
            analysts {
              id
              ...UserSearchDropdownChoice_user
            }
          }
        }
      }
    }
  }
`;

const commit = (variables: RevokeAnalystsToProposalsMutationVariables): Promise<Response> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
