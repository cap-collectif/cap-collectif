import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateProjectSlugMutation,
  UpdateProjectSlugMutation$variables,
  UpdateProjectSlugMutation$data,
} from '@relay/UpdateProjectSlugMutation.graphql'

const mutation = graphql`
  mutation UpdateProjectSlugMutation($input: UpdateProjectSlugInput!) {
    updateProjectSlug(input: $input) {
      project {
        id
        url
        slug
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateProjectSlugMutation$variables): Promise<UpdateProjectSlugMutation$data> =>
  commitMutation<UpdateProjectSlugMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
