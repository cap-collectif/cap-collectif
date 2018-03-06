// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProposalFormNotificationsConfigurationMutationVariables,
  UpdateProposalFormNotificationsConfigurationMutationResponse,
} from './__generated__/UpdateProposalFormNotificationsConfigurationMutation.graphql';

const mutation = graphql`
  mutation UpdateProposalFormNotificationsConfigurationMutation(
    $input: UpdateProposalFormNotificationsConfigurationInput!
  ) {
    updateProposalFormNotificationsConfiguration(input: $input) {
      proposalForm {
        id
        notificationsConfiguration {
          onCreate
          onUpdate
          onDelete
          onCommentCreate
          onCommentUpdate
          onCommentDelete
        }
      }
    }
  }
`;

const commit = (
  variables: UpdateProposalFormNotificationsConfigurationMutationVariables,
): Promise<UpdateProposalFormNotificationsConfigurationMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
