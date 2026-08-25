import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import {
  UpdateProjectTypeMutation,
  UpdateProjectTypeMutation$data,
  UpdateProjectTypeMutation$variables,
} from '@relay/UpdateProjectTypeMutation.graphql'
import { environment } from '@utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation UpdateProjectTypeMutation($input: UpdateProjectTypeInput!) {
    updateProjectType(input: $input) {
      projectType {
        id
        title
        color
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateProjectTypeMutation$variables): Promise<UpdateProjectTypeMutation$data> =>
  commitMutation<UpdateProjectTypeMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
