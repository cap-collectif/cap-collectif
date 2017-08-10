// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ChangeProposalContentMutationVariables,
  ChangeProposalContentMutationResponse,
} from './__generated__/ChangeProposalContentMutation.graphql';

const mutation = graphql`
  mutation ChangeProposalContentMutation($input: ChangeProposalContentInput!) {
    changeProposalContent(input: $input) {
      proposal {
        publicationStatus
      }
    }
  }
`;

const commit = (
  variables: ChangeProposalContentMutationVariables,
  uploadables: any = undefined,
): Promise<ChangeProposalContentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    uploadables,
    variables,
  });

export default { commit };
