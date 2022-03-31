// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProjectSlugMutationVariables,
  UpdateProjectSlugMutationResponse,
} from '~relay/UpdateProjectSlugMutation.graphql';

const mutation = graphql`
  mutation UpdateProjectSlugMutation($input: UpdateProjectSlugInput!) {
    updateProjectSlug(input: $input) {
      project {
        id
        url
      }
      errorCode
    }
  }
`;

const commit = (
  variables: UpdateProjectSlugMutationVariables,
): Promise<UpdateProjectSlugMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('updateProjectSlug');
      if (!payload) return;
      const updatedProject = payload.getLinkedRecord('project');
      if (!updatedProject) return;
      const projectId = updatedProject.getValue('id');
      const updatedUrl = updatedProject.getValue('url');

      const rootFields = store.getRoot();
      if (!rootFields) return;
      const projectNode = rootFields.getLinkedRecord('node', { id: projectId });
      if (!projectNode) return;
      projectNode.setValue(updatedUrl, 'url');
    },
  });

export default { commit };
