// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateRequirementMutationVariables,
  UpdateRequirementMutationResponse,
} from '~relay/UpdateRequirementMutation.graphql';

const mutation = graphql`
  mutation UpdateRequirementMutation($input: UpdateRequirementInput!) {
    updateRequirement(input: $input) {
      requirement {
        id
        viewerMeetsTheRequirement
      }
    }
  }
`;

const commit = (
  variables: UpdateRequirementMutationVariables,
): Promise<UpdateRequirementMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
