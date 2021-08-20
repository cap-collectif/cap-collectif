// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProposalSocialNetworksMutationVariables,
  UpdateProposalSocialNetworksMutationResponse,
} from '~relay/UpdateProposalSocialNetworksMutation.graphql';

const mutation = graphql`
  mutation UpdateProposalSocialNetworksMutation($input: UpdateProposalSocialNetworksInput!) {
    updateProposalSocialNetworks(input: $input) {
      proposal {
        id
        twitterUrl
        webPageUrl
        facebookUrl
        instagramUrl
        linkedInUrl
        youtubeUrl
        ...ProposalSocialNetworkLinks_proposal
        ...ModalProposalSocialNetworks_proposal
      }
      errorCode
    }
  }
`;

const commit = (
  variables: UpdateProposalSocialNetworksMutationVariables,
): Promise<UpdateProposalSocialNetworksMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
