// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  GenerateJitsiRoomMutationVariables,
  GenerateJitsiRoomMutationResponse,
} from '~relay/GenerateJitsiRoomMutation.graphql';

const mutation = graphql`
  mutation GenerateJitsiRoomMutation($input: GenerateJitsiRoomMutationInput!) {
    generateJitsiRoomMutation(input: $input) {
      jitsiToken
      roomName
    }
  }
`;

const commit = (
  variables: GenerateJitsiRoomMutationVariables,
): Promise<GenerateJitsiRoomMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
