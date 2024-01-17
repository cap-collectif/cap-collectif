import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';

import type {
  UpdateParticipantRequirementMutation,
  UpdateParticipantRequirementMutationVariables,
  UpdateParticipantRequirementMutationResponse,
} from '@relay/UpdateParticipantRequirementMutation.graphql';

const mutation = graphql`
    mutation UpdateParticipantRequirementMutation($input: UpdateParticipantRequirementInput!) {
        updateParticipantRequirement(input: $input) {
            requirement {
              id
            }
        }
    }
`;

const commit = (
  variables: UpdateParticipantRequirementMutationVariables,
): Promise<UpdateParticipantRequirementMutationResponse> =>
  commitMutation<UpdateParticipantRequirementMutation>(environment, {
    mutation,
    variables,
  });

export default { commit };
