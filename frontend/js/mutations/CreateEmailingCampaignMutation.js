// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateEmailingCampaignMutationVariables,
  CreateEmailingCampaignMutationResponse,
} from '~relay/CreateEmailingCampaignMutation.graphql';

const mutation = graphql`
  mutation CreateEmailingCampaignMutation($input: CreateEmailingCampaignInput!) {
    createEmailingCampaign(input: $input) {
      error
      emailingCampaign {
        id
      }
    }
  }
`;

const commit = (
  variables: CreateEmailingCampaignMutationVariables,
): Promise<CreateEmailingCampaignMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
