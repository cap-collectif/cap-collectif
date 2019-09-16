// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddEventMutationResponse,
  AddEventMutationVariables,
} from '~relay/AddEventMutation.graphql';

const mutation = graphql`
  mutation AddEventMutation($input: AddEventInput!) {
    addEvent(input: $input) {
      eventEdge {
        node {
          id
          _id
        }
      }
      userErrors {
        message
      }
    }
  }
`;

const commit = (variables: AddEventMutationVariables): Promise<AddEventMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
