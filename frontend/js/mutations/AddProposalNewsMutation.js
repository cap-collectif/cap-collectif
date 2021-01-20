// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddProposalNewsMutationVariables,
  AddProposalNewsMutationResponse,
} from '~relay/AddProposalNewsMutation.graphql';

const mutation = graphql`
  mutation AddProposalNewsMutation($input: AddProposalNewsInput!) {
    addProposalNews(input: $input) {
      proposalPost {
        id
        title
        abstract
      }
      errorCode
    }
  }
`;

const commit = (
  variables: AddProposalNewsMutationVariables,
): Promise<AddProposalNewsMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
