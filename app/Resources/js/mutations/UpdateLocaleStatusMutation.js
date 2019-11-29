// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateLocaleStatusMutationResponse,
  UpdateLocaleStatusMutationVariables,
} from '~relay/UpdateLocaleStatusMutation.graphql';

const mutation = graphql`
  mutation UpdateLocaleStatusMutation($input: UpdateLocaleStatusInput!) {
    updateLocaleStatus(input: $input) {
      locale {
        id
        code
        isEnabled
        isPublished
        isDefault
      }
    }
  }
`;

const commit = (
  variables: UpdateLocaleStatusMutationVariables,
): Promise<UpdateLocaleStatusMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
