import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteCustomDomainMutation,
  DeleteCustomDomainMutation$data,
  DeleteCustomDomainMutation$variables,
} from '@relay/DeleteCustomDomainMutation.graphql'

const mutation = graphql`
  mutation DeleteCustomDomainMutation($input: DeleteCustomDomainInput!) {
    deleteCustomDomain(input: $input) {
      siteSettings {
        capcoDomain
        customDomain
        status
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteCustomDomainMutation$variables): Promise<DeleteCustomDomainMutation$data> =>
  commitMutation<DeleteCustomDomainMutation>(environment, {
    mutation,
    variables,
    updater: (store: any) => {
      const root = store.getRoot()
      const payload = store.getRootField('deleteCustomDomain')
      const errorCode = payload.getValue('errorCode')
      if (errorCode) return

      const payloadSiteSettings = payload.getLinkedRecord('siteSettings')
      const status = payloadSiteSettings.getValue('status')
      const customDomain = payloadSiteSettings.getValue('customDomain')

      const rootSiteSettings = root.getLinkedRecord('siteSettings')
      rootSiteSettings.setValue(status, 'status')
      rootSiteSettings.setValue(customDomain, 'customDomain')
    },
  })

export default { commit }
