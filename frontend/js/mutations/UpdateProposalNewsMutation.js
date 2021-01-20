// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProposalNewsMutationVariables,
  UpdateProposalNewsMutationResponse,
} from '~relay/UpdateProposalNewsMutation.graphql';

const mutation = graphql`
  mutation UpdateProposalNewsMutation($input: UpdateProposalNewsInput!) {
    updateProposalNews(input: $input) {
      proposalPost {
        id
        title
        translations {
          body
          title
          abstract
        }
      }
      errorCode
    }
  }
`;

const commit = (
  variables: UpdateProposalNewsMutationVariables,
): Promise<UpdateProposalNewsMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
