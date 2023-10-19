// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  DeleteProjectMutationResponse,
  DeleteProjectMutationVariables,
} from '~relay/DeleteProjectMutation.graphql'

const mutation = graphql`
  mutation DeleteProjectMutation($input: DeleteProjectInput!, $connections: [ID!]!) {
    deleteProject(input: $input) {
      deletedProjectId @deleteEdge(connections: $connections)
    }
  }
`

const commit = (variables: DeleteProjectMutationVariables): Promise<DeleteProjectMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      deleteProject: {
        deletedProjectId: variables.input.id,
      },
    },
  })

export default {
  commit,
}
