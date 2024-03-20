import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import {
  UpdateNewProjectMutation,
  UpdateNewProjectMutation$data,
  UpdateNewProjectMutation$variables,
} from '@relay/UpdateNewProjectMutation.graphql'

const mutation = graphql`
  mutation UpdateNewProjectMutation($input: UpdateNewProjectInput!) {
    updateNewProject(input: $input) {
      project {
        title
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateNewProjectMutation$variables): Promise<UpdateNewProjectMutation$data> =>
  commitMutation<UpdateNewProjectMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
