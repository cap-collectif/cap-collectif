// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeletePostMutationVariables,
  DeletePostMutationResponse,
} from '~relay/DeletePostMutation.graphql';

const mutation = graphql`
  mutation DeletePostMutation($input: DeletePostInput!) {
    deletePost(input: $input) {
      errorCode
    }
  }
`;

const commit = (variables: DeletePostMutationVariables): Promise<DeletePostMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
