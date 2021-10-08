// @flow
import { graphql } from 'react-relay';
import type { IntlShape } from 'react-intl';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DuplicateProjectMutationResponse,
  DuplicateProjectMutationVariables,
} from '~relay/DuplicateProjectMutation.graphql';
import type { ProjectItem_project } from '~relay/ProjectItem_project.graphql';

const mutation = graphql`
  mutation DuplicateProjectMutation($input: DuplicateProjectInput!, $connections: [ID!]!) {
    duplicateProject(input: $input) {
      newProject @prependNode(connections: $connections, edgeTypeName: "ProjectEdge") {
        ...ProjectItem_project
      }
    }
  }
`;

const commit = (
  variables: DuplicateProjectMutationVariables,
  projectDuplicated: ProjectItem_project,
  intl: IntlShape,
): Promise<DuplicateProjectMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      duplicateProject: {
        newProject: {
          ...projectDuplicated,
          id: new Date().toISOString(),
          title: `${intl.formatMessage({ id: 'copy-of' })} ${projectDuplicated.title}`,
          publishedAt: new Date(),
        },
      },
    },
  });

export default { commit };
