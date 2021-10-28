// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CheckIdentificationCodeMutationVariables,
  CheckIdentificationCodeMutationResponse as Response,
} from '~relay/CheckIdentificationCodeMutation.graphql';

export type CheckIdentificationCodeMutationResponse = Response;

const mutation = graphql`
  mutation CheckIdentificationCodeMutation($input: CheckIdentificationCodeInput!) {
    checkIdentificationCode(input: $input) {
      user {
        id
      }
      errorCode
    }
  }
`;

const commit = (variables: CheckIdentificationCodeMutationVariables): Promise<Response> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
