// @flow
import { graphql } from 'react-relay';
import commitMutation from '~/mutations/commitMutation';
import environment from '~/createRelayEnvironment';
import type {
  ApplyProposalStatusMutationVariables,
  ApplyProposalStatusMutationResponse,
} from '~relay/ApplyProposalStatusMutation.graphql';
import type { ProposalsStepValues } from '~/components/Admin/Project/ProjectAdminPage.reducer';

type Variables = {
  ...ApplyProposalStatusMutationVariables,
  step: ProposalsStepValues,
};

const mutation = graphql`
  mutation ApplyProposalStatusMutation($input: ApplyProposalStatusInput!, $step: ID!) {
    applyProposalStatus(input: $input) {
      proposals {
        edges {
          node {
            id
            status(step: $step) {
              id
              name
              color
            }
          }
        }
      }
    }
  }
`;

const commit = (variables: Variables): Promise<ApplyProposalStatusMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
