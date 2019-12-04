// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddEventsMutationVariables,
  AddEventsMutationResponse,
} from '~relay/AddEventsMutation.graphql';

const mutation = graphql`
  mutation AddEventsMutation($input: AddEventsInput!) {
    addEvents(input: $input) {
      importedEvents {
        id
      }
      notFoundEmails
      notFoundThemes
      brokenDates
    }
  }
`;

const commit = (variables: AddEventsMutationVariables): Promise<AddEventsMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
