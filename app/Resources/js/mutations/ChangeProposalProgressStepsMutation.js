// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ChangeProposalProgressStepsMutationVariables,
  ChangeProposalProgressStepsMutationResponse,
} from '~relay/ChangeProposalProgressStepsMutation.graphql';

const mutation = graphql`
  mutation ChangeProposalProgressStepsMutation($input: ChangeProposalProgressStepsInput!) {
    changeProposalProgressSteps(input: $input) {
      proposal {
        id
        progressSteps {
          id
          title
          startAt
          endAt
        }
      }
    }
  }
`;

const commit = (
  variables: ChangeProposalProgressStepsMutationVariables,
): Promise<ChangeProposalProgressStepsMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
