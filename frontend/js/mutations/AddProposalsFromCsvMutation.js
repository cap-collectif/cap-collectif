// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddProposalsFromCsvMutationVariables,
  AddProposalsFromCsvMutationResponse,
} from '~relay/AddProposalsFromCsvMutation.graphql';

const mutation = graphql`
  mutation AddProposalsFromCsvMutation($input: AddProposalsFromCsvInput!) {
    addProposalsFromCsv(input: $input) {
      badLines
      duplicates
      mandatoryMissing
      importedProposals {
        totalCount
        edges {
          node {
            id
          }
        }
      }
      errorCode
    }
  }
`;

const commit = (
  variables: AddProposalsFromCsvMutationVariables,
): Promise<AddProposalsFromCsvMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
