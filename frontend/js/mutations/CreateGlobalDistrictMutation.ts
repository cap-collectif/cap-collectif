// @ts-nocheck
import { graphql } from 'react-relay'
import { ConnectionHandler } from 'relay-runtime'
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  CreateGlobalDistrictMutationVariables,
  CreateGlobalDistrictMutationResponse,
  DistrictTranslationInput,
} from '~relay/CreateGlobalDistrictMutation.graphql'
import { getTranslation } from '~/services/Translation'

const mutation = graphql`
  mutation CreateGlobalDistrictMutation($input: CreateGlobalDistrictInput!) {
    createGlobalDistrict(input: $input) {
      districtEdge {
        cursor
        node {
          id
          geojson
          displayedOnMap
          border {
            enabled
            color
            opacity
            size
          }
          background {
            enabled
            color
            opacity
          }
          translations {
            locale
            name
          }
        }
      }
    }
  }
`

const updater = (store: RecordSourceSelectorProxy) => {
  const payload = store.getRootField('createGlobalDistrict')

  if (!payload) {
    return
  }

  const districtEdge = payload.getLinkedRecord('districtEdge')

  if (!districtEdge) {
    return
  }

  const root = store.getRoot()
  const connection = ConnectionHandler.getConnection(root, 'GlobalDistrictAdminPage_districts')

  if (connection) {
    ConnectionHandler.insertEdgeAfter(connection, districtEdge)
  }
}

const commit = (
  variables: CreateGlobalDistrictMutationVariables,
  locale: string | null | undefined = null,
): Promise<CreateGlobalDistrictMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater,
    optimisticUpdater: (store: RecordSourceSelectorProxy) => {
      const root = store.getRoot()
      const id = `to-be-defined-${Math.floor(Math.random() * Math.floor(1000))}`
      const translation = getTranslation<DistrictTranslationInput>(variables.input.translations, locale)
      const node = store.create(id, 'districtEdge')
      node.setValue(id, 'id')
      // @ts-expect-error TODO @mrpandat
      node.setValue(translation ? translation.name : 'translation-not-available')
      const newEdge = store.create(`client:newEdge:${id}`, 'districtEdge')
      newEdge.setLinkedRecord(node, 'node')
      const connection = ConnectionHandler.getConnection(root, 'GlobalDistrictAdminPage_districts')

      if (connection) {
        ConnectionHandler.insertEdgeAfter(connection, newEdge)
      }
    },
  })

export default {
  commit,
}
