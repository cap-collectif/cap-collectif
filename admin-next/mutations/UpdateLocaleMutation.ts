import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import {
  UpdateLocaleMutation,
  UpdateLocaleMutation$data,
  UpdateLocaleMutation$variables,
} from '@relay/UpdateLocaleMutation.graphql'

const mutation = graphql`
  mutation UpdateLocaleMutation($input: UpdateLocaleInput!) {
    updateLocale(input: $input) {
      locale
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateLocaleMutation$variables): Promise<UpdateLocaleMutation$data> =>
  commitMutation<UpdateLocaleMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
