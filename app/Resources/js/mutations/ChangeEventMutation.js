// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ChangeEventMutationResponse,
  ChangeEventMutationVariables,
} from '~relay/ChangeEventMutation.graphql';

const mutation = graphql`
  mutation ChangeEventMutation($input: ChangeEventInput!) {
    changeEvent(input: $input) {
      eventEdge {
        node {
          id
        }
      }
    }
  }
`;

const commit = (variables: ChangeEventMutationVariables): Promise<ChangeEventMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
