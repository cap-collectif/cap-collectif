// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateMailingListMutationVariables,
  CreateMailingListMutationResponse,
} from '~relay/CreateMailingListMutation.graphql';

const mutation = graphql`
  mutation CreateMailingListMutation($input: CreateMailingListInput!) {
    createMailingList(input: $input) {
      error
      mailingList {
        name
      }
    }
  }
`;

const commit = (
  variables: CreateMailingListMutationVariables,
): Promise<CreateMailingListMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
