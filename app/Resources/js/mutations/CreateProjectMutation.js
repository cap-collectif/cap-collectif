// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateProjectMutationVariables,
  CreateProjectMutationResponse,
} from '~relay/CreateProjectMutation.graphql';

const mutation = graphql`
  mutation CreateProjectMutation($input: CreateProjectInput!) {
    createProject(input: $input) {
      project {
        id
        adminUrl
      }
    }
  }
`;

const commit = (
  variables: CreateProjectMutationVariables,
): Promise<CreateProjectMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
