// @flow
import { graphql } from 'react-relay';
import commitMutation from '~/mutations/commitMutation';
import environment from '~/createRelayEnvironment';
import type {
  AddProposalsToStepsMutationVariables,
  AddProposalsToStepsMutationResponse,
} from '~relay/AddProposalsToStepsMutation.graphql';
import type { ProposalsStepValues } from '~/components/Admin/Project/ProjectAdminPage.reducer';

type Variables = {
  ...AddProposalsToStepsMutationVariables,
  step: ProposalsStepValues,
};

const mutation = graphql`
  mutation AddProposalsToStepsMutation($input: AddProposalsToStepsInput!, $step: ID!) {
    addProposalsToSteps(input: $input) {
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
                title
              }
            }
          }
          cursor
        }
      }
    }
  }
`;

const commit = (variables: Variables): Promise<AddProposalsToStepsMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
