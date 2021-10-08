// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateProjectMutationVariables,
  CreateProjectMutationResponse,
} from '~relay/CreateProjectMutation.graphql';

const mutation = graphql`
  mutation CreateProjectMutation($input: CreateProjectInput!, $connections: [ID!]!) {
    createProject(input: $input) {
      project @prependNode(connections: $connections, edgeTypeName: "ProjectEdge") {
        ...ProjectItem_project
        adminAlphaUrl
      }
    }
  }
`;

const commit = (
  variables: CreateProjectMutationVariables,
  isAdmin: boolean,
  isProjectAdmin?: boolean,
): Promise<CreateProjectMutationResponse> => {
  return commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      createProject: {
        project: {
          id: new Date().toISOString(),
          title: variables.input.title,
          publishedAt: new Date(),
          themes: [],
          authors: [],
          visibility: isProjectAdmin ? 'ME' : isAdmin ? 'ADMIN' : null,
          adminUrl: '',
          adminAlphaUrl: '',
        },
      },
    },
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('createProject');
      if (!payload) return;
      const errorCode = payload.getValue('errorCode');
      if (errorCode) return;

      const rootFields = store.getRoot();
      const viewer = rootFields.getLinkedRecord('viewer');
      if (!viewer) return;
      const projects = viewer.getLinkedRecord('project', {
        affiliations: isAdmin ? null : ['OWNER'],
      });
      if (!projects) return;

      const totalCount = parseInt(projects.getValue('totalCount'), 10);
      projects.setValue(totalCount + 1, 'totalCount');
    },
  });
};

export default { commit };
