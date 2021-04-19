// @flow
import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import environnement from '~/createRelayEnvironment';
import type {
  UpdateHomePageProjectsSectionAdminMutationResponse as Response,
  UpdateHomePageProjectsSectionAdminMutationVariables,
} from '~relay/UpdateHomePageProjectsSectionAdminMutation.graphql';

const mutation = graphql`
  mutation UpdateHomePageProjectsSectionAdminMutation(
    $input: UpdateHomePageProjectsSectionAdminInput!
  ) {
    updateHomePageProjectsSectionAdmin(input: $input) {
      errorCode
      homePageProjectsSectionAdmin {
        title
        teaser
        position
        displayMode
        nbObjects
        enabled
        projects {
          edges {
            node {
              title
            }
          }
        }
      }
    }
  }
`;

const commit = (
  variables: UpdateHomePageProjectsSectionAdminMutationVariables,
): Promise<Response> =>
  commitMutation(environnement, {
    mutation,
    variables,
  });

export default { commit };
