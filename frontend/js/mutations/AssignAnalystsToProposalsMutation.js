// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AssignAnalystsToProposalsMutationVariables,
  AssignAnalystsToProposalsMutationResponse as Response,
} from '~relay/AssignAnalystsToProposalsMutation.graphql';

const mutation = graphql`
  mutation AssignAnalystsToProposalsMutation($input: AssignAnalystsToProposalsInput!) {
    assignAnalystsToProposals(input: $input) {
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

const commit = (variables: AssignAnalystsToProposalsMutationVariables): Promise<Response> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
