// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  TestEmailingCampaignMutationVariables,
  TestEmailingCampaignMutationResponse,
} from '~relay/TestEmailingCampaignMutation.graphql';

const mutation = graphql`
  mutation TestEmailingCampaignMutation($input: TestEmailingCampaignInput!) {
    testEmailingCampaign(input: $input) {
      error
      html
    }
  }
`;
const commit = (
  variables: TestEmailingCampaignMutationVariables,
): Promise<TestEmailingCampaignMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
