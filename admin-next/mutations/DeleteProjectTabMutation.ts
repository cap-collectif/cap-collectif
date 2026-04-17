import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteProjectTabMutation,
  DeleteProjectTabMutation$variables,
  DeleteProjectTabMutation$data,
} from '@relay/DeleteProjectTabMutation.graphql'

const mutation = graphql`
  mutation DeleteProjectTabMutation($input: DeleteProjectTabInput!) {
    deleteProjectTab(input: $input) {
      deletedProjectTabId
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteProjectTabMutation$variables): Promise<DeleteProjectTabMutation$data> =>
  commitMutation<DeleteProjectTabMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
