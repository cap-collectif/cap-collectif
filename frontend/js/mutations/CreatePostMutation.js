// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreatePostMutationVariables,
  CreatePostMutationResponse,
} from '~relay/CreatePostMutation.graphql';

const mutation = graphql`
  mutation CreatePostMutation($input: CreatePostInput!) {
    createPost(input: $input) {
      post {
        title
        body
      }
      errorCode
    }
  }
`;

const commit = (variables: CreatePostMutationVariables): Promise<CreatePostMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
