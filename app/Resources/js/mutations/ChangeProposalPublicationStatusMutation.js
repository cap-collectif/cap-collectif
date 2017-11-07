// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ChangeProposalPublicationStatusMutationVariables,
  ChangeProposalPublicationStatusMutationResponse,
} from './__generated__/ChangeProposalContentMutation.graphql';

const mutation = graphql`
  mutation ChangeProposalPublicationStatusMutation($input: ChangeProposalPublicationStatusInput!) {
    changeProposalPublicationStatus(input: $input) {
      proposal {
        id
        publicationStatus
        trashedReason
      }
    }
  }
`;

const commit = (
  variables: ChangeProposalPublicationStatusMutationVariables,
): Promise<ChangeProposalPublicationStatusMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
