import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateThemeMutation,
  CreateThemeMutation$data,
  CreateThemeMutation$variables,
} from '@relay/CreateThemeMutation.graphql'

const mutation = graphql`
  mutation CreateThemeMutation($input: CreateThemeInput!) {
    createTheme(input: $input) {
      theme {
        id
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: CreateThemeMutation$variables): Promise<CreateThemeMutation$data> =>
  commitMutation<CreateThemeMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
