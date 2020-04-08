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
        totalCount
        pageInfo {
          hasNextPage
        }
        edges {
          node {
            author {
              id
              username
            }
            adminUrl
            publishedAt
            district {
              id
              name
            }
            category {
              id
              name
            }
            reference(full: false)
            id
            title
            status(step: $step) {
              id
              name
              color
            }
            form {
              step {
                id
                title
              }
            }
            selections {
              step {
                id
              }
            }
          }
          cursor
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
