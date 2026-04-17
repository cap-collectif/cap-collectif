import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  ReorderProjectTabsMutation,
  ReorderProjectTabsMutation$variables,
  ReorderProjectTabsMutation$data,
} from '@relay/ReorderProjectTabsMutation.graphql'

const mutation = graphql`
  mutation ReorderProjectTabsMutation($input: ReorderProjectTabsInput!) {
    reorderProjectTabs(input: $input) {
      project {
        tabs {
          id
          position
        }
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: ReorderProjectTabsMutation$variables): Promise<ReorderProjectTabsMutation$data> =>
  commitMutation<ReorderProjectTabsMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
