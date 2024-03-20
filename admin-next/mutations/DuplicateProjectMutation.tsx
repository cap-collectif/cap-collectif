import { graphql } from 'react-relay'
import type { IntlShape } from 'react-intl'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DuplicateProjectMutation$data,
  DuplicateProjectMutation$variables,
  DuplicateProjectMutation,
} from '@relay/DuplicateProjectMutation.graphql'
import type { ProjectItem_project$data } from '@relay/ProjectItem_project.graphql'

const mutation = graphql`
  mutation DuplicateProjectMutation($input: DuplicateProjectInput!, $connections: [ID!]!) @raw_response_type {
    duplicateProject(input: $input) {
      newProject @prependNode(connections: $connections, edgeTypeName: "ProjectEdge") {
        ...ProjectItem_project
      }
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: DuplicateProjectMutation$variables,
  projectDuplicated: ProjectItem_project$data,
  intl: IntlShape,
): Promise<DuplicateProjectMutation$data> =>
  commitMutation<DuplicateProjectMutation>(environment, {
    mutation,
    variables,
    optimisticResponse: {
      duplicateProject: {
        // @ts-ignore see with @AlexTea
        newProject: {
          ...projectDuplicated,
          id: new Date().toISOString(),
          title: `${intl.formatMessage({ id: 'copy-of' })} ${projectDuplicated.title}`,
          publishedAt: new Date().toISOString(),
          contributions: { totalCount: 0 },
        },
      },
    },
  })

export default { commit }
