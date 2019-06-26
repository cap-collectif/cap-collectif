// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProjectMutationVariables,
  UpdateProjectMutationResponse,
} from '~relay/UpdateProjectMutation.graphql';

const mutation = graphql`
  mutation UpdateProjectMutation($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      project {
       ...ProjectContentAdminForm_project
      }
    }
  }
`;

const commit = (
  variables: UpdateProjectMutationVariables,
): Promise<UpdateProjectMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
