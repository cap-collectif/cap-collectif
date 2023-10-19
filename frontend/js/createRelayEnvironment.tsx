import * as React from 'react'
import { commitLocalUpdate } from 'react-relay'
import type { RecordSourceProxy } from 'relay-runtime'
import { Environment, Network, RecordSource, Store } from 'relay-runtime'
import config from './config'
import executeFunction from './network/executeFunction'
import relayTransactionLogger from './relayTransactionLogger'

export const graphqlError = (
  // eslint-disable-next-line react/no-unescaped-entities
  <p className="text-danger">Désolé une erreur s'est produite… Réessayez plus tard.</p>
)

const store = new Store(new RecordSource())
const network = Network.create(executeFunction)
const environment = new Environment({
  network,
  store,
  log: config.isDev ? relayTransactionLogger : null,
})
commitLocalUpdate(environment, (storeProxy: RecordSourceProxy) => {
  // @ts-expect-error
  const featureFlags = typeof window !== 'undefined' ? window._capco_featureFlags || [] : []
  const newfeatureFlagsRecords = featureFlags.map((f, key) => {
    const newRecord = storeProxy.create(`client:root:featureFlags:${key}`, 'FeatureFlag')
    newRecord.setValue(f.enabled, 'enabled')
    newRecord.setValue(f.type, 'type')
    return newRecord
  })
  storeProxy.getRoot().setLinkedRecords(newfeatureFlagsRecords, 'featureFlags')

  // We don't need feature flags in `window` anymore, so make sure none is using it that way.
  if (featureFlags.length) {
    // @ts-expect-error
    delete window._capco_featureFlags
  }
})
export default environment
