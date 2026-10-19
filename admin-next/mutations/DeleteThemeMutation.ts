import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteThemeMutation,
  DeleteThemeMutation$data,
  DeleteThemeMutation$variables,
} from '@relay/DeleteThemeMutation.graphql'

const mutation = graphql`
  mutation DeleteThemeMutation($input: DeleteThemeInput!, $connections: [ID!]!) {
    deleteTheme(input: $input) {
      deletedThemeId @deleteEdge(connections: $connections)
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteThemeMutation$variables): Promise<DeleteThemeMutation$data> =>
  commitMutation<DeleteThemeMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
