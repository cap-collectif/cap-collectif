// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RemoveContactFormMutationVariables,
  RemoveContactFormMutationResponse,
} from './__generated__/RemoveContactFormMutation.graphql';

const mutation = graphql`
  mutation RemoveContactFormMutation($input: RemoveContactFormInput!) {
    removeContactForm(input: $input) {
      deletedContactFormId
    }
  }
`;

const commit = (
  variables: RemoveContactFormMutationVariables,
): Promise<RemoveContactFormMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    configs: [
      {
        type: 'NODE_DELETE',
        deletedIDFieldName: 'deletedContactFormId',
      },
    ],
  });

export default { commit };
