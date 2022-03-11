// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdatePostMutationVariables,
  UpdatePostMutationResponse,
} from '~relay/UpdatePostMutation.graphql';

const mutation = graphql`
  mutation UpdatePostMutation($input: UpdatePostInput!) {
    updatePost(input: $input) {
      post {
        title
        body
        bodyUsingJoditWysiwyg
      }
      errorCode
    }
  }
`;

const commit = (variables: UpdatePostMutationVariables): Promise<UpdatePostMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
