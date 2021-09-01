// @flow
import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import environment from '../createRelayEnvironment';
import type {
  ChangeProposalNotationMutationVariables,
  ChangeProposalNotationMutationResponse,
} from '~relay/ChangeProposalNotationMutation.graphql';

const mutation = graphql`
  mutation ChangeProposalNotationMutation($input: ChangeProposalNotationInput!) {
    changeProposalNotation(input: $input) {
      proposal {
        id
        estimation
        likers {
          id
          displayName
        }
        form {
          evaluationForm {
            description
            questions {
              id
              ...responsesHelper_adminQuestion @relay(mask: false)
            }
          }
        }
        evaluation {
          version
          responses {
            ...responsesHelper_response @relay(mask: false)
          }
        }
      }
    }
  }
`;

const commit = (
  variables: ChangeProposalNotationMutationVariables,
): Promise<ChangeProposalNotationMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
