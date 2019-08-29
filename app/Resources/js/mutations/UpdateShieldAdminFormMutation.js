// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateShieldAdminFormMutationVariables,
  UpdateShieldAdminFormMutationResponse,
} from '~relay/UpdateShieldAdminFormMutation.graphql';

const mutation = graphql`
  mutation UpdateShieldAdminFormMutation($input: InternalUpdateShieldAdminFormInput!) {
    updateShieldAdminForm(input: $input) {
      shieldAdminForm {
        ...ShieldAdminForm_shieldAdminForm
      }
    }
  }
`;
const commit = (
  variables: UpdateShieldAdminFormMutationVariables,
): Promise<UpdateShieldAdminFormMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
