// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateShieldAdminFormVariables,
  UpdateShieldAdminFormResponse,
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
  variables: UpdateShieldAdminFormVariables,
): Promise<UpdateShieldAdminFormResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
