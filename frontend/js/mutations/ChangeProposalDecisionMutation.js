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
        proposal {
          id
          decision {
            estimatedCost
            post {
              id
              translations {
                title
                body
              }
              authors {
                id
              }
            }
            id
            state
            updatedBy {
              id
            }
            isApproved
          }
        }
        estimatedCost
        post {
          id
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
