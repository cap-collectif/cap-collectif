import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateLocaleStatusMutation,
  UpdateLocaleStatusMutation$data,
  UpdateLocaleStatusMutation$variables,
} from '@relay/UpdateLocaleStatusMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateLocaleStatusMutation($input: UpdateLocaleStatusInput!) {
    updateLocaleStatus(input: $input) {
      locales {
        edges {
          node {
            id
            code
            isEnabled
            isPublished
            isDefault
          }
        }
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateLocaleStatusMutation$variables): Promise<UpdateLocaleStatusMutation$data> =>
  commitMutation<UpdateLocaleStatusMutation>(environment, { mutation, variables })

export default { commit }
