// @ts-nocheck
import { graphql } from 'react-relay'
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UpdateExternalServiceConfigurationMutationVariables,
  UpdateExternalServiceConfigurationMutationResponse,
} from '~relay/UpdateExternalServiceConfigurationMutation.graphql'

const mutation = graphql`
  mutation UpdateExternalServiceConfigurationMutation($input: UpdateExternalServiceConfigurationInput!) {
    updateExternalServiceConfiguration(input: $input) {
      error
      externalServiceConfiguration {
        ...SectionEmailingService_externalServiceConfiguration
      }
    }
  }
`

const commit = (
  variables: UpdateExternalServiceConfigurationMutationVariables,
): Promise<UpdateExternalServiceConfigurationMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticUpdater: (store: RecordSourceSelectorProxy) => {
      const externalServiceConfigurationProxy = store.getRoot().getLinkedRecord('externalServiceConfiguration', {
        type: 'MAILER',
      })

      if (!externalServiceConfigurationProxy) {
        throw new Error('Expected externalServiceConfiguration to be in the store')
      }

      externalServiceConfigurationProxy.setValue(variables.input.value, 'value')
    },
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('updateExternalServiceConfiguration')
      if (!payload) return
      const error = payload.getValue('error')
      if (error) return
      const externalServiceConfigurationProxy = store.getRoot().getLinkedRecord('externalServiceConfiguration', {
        type: 'MAILER',
      })

      if (!externalServiceConfigurationProxy) {
        throw new Error('Expected externalServiceConfiguration to be in the store')
      }

      const externalServiceConfigurationUpdated = payload.getLinkedRecord('externalServiceConfiguration')
      const valueUpdated = externalServiceConfigurationUpdated?.getValue('value')
      externalServiceConfigurationProxy.setValue(valueUpdated, 'value')
    },
  })

export default {
  commit,
}
