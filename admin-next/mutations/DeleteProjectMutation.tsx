import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteProjectMutation,
  DeleteProjectMutation$data,
  DeleteProjectMutation$variables,
} from '@relay/DeleteProjectMutation.graphql'

const mutation = graphql`
  mutation DeleteProjectMutation($input: DeleteProjectInput!, $connections: [ID!]!) @raw_response_type {
    deleteProject(input: $input) {
      deletedProjectId @deleteEdge(connections: $connections)
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteProjectMutation$variables): Promise<DeleteProjectMutation$data> =>
  commitMutation<DeleteProjectMutation>(environment, {
    mutation,
    variables,
    optimisticResponse: {
      deleteProject: {
        deletedProjectId: variables.input.id,
      },
    },
  })

export default { commit }
