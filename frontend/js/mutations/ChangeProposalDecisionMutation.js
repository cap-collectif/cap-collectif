// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ChangeProposalDecisionMutationVariables,
  ChangeProposalDecisionMutationResponse,
} from '~relay/ChangeProposalDecisionMutation.graphql';

const mutation = graphql`
  mutation ChangeProposalDecisionMutation($input: ChangeProposalDecisionInput!) {
    changeProposalDecision(input: $input) {
      errorCode
      decision {
        isApproved
        state
        refusedReason {
          id
        }
        estimatedCost
        post {
          translations {
            title
            body
          }
          authors {
            id
          }
        }
      }
    }
  }
`;

const commit = (
  variables: ChangeProposalDecisionMutationVariables,
): Promise<ChangeProposalDecisionMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
