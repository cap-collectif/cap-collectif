import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  SetDefaultLocaleMutation,
  SetDefaultLocaleMutation$data,
  SetDefaultLocaleMutation$variables,
} from '@relay/SetDefaultLocaleMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation SetDefaultLocaleMutation($input: SetDefaultLocaleInput!) {
    setDefaultLocale(input: $input) {
      locale {
        id
        code
        isEnabled
        isPublished
        isDefault
      }
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: SetDefaultLocaleMutation$variables,
  previousDefaultId?: string,
): Promise<SetDefaultLocaleMutation$data> =>
  commitMutation<SetDefaultLocaleMutation>(environment, {
    mutation,
    variables,
    updater: (store, data) => {
      if (data?.setDefaultLocale?.locale && previousDefaultId && previousDefaultId !== variables.input.id) {
        store.get(previousDefaultId)?.setValue(false, 'isDefault')
      }
    },
  })

export default { commit }
