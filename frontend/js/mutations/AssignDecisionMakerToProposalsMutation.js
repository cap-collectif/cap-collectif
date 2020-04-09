// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AssignDecisionMakerToProposalsMutationVariables,
  AssignDecisionMakerToProposalsMutationResponse as Response,
} from '~relay/AssignDecisionMakerToProposalsMutation.graphql';

const mutation = graphql`
  mutation AssignDecisionMakerToProposalsMutation($input: AssignDecisionMakerToProposalsInput!) {
    assignDecisionMakerToProposals(input: $input) {
      errorCode
      proposals {
        edges {
          node {
            id
            ...AnalysisProposalListRole_proposal
            supervisor {
              id
              ...UserSearchDropdownChoice_user
            }
          }
        }
      }
    }
  }
`;

const commit = (variables: AssignDecisionMakerToProposalsMutationVariables): Promise<Response> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
