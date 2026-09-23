import { commitLocalUpdate } from 'react-relay'
import { Environment, Network, RecordSource, Store } from 'relay-runtime'
import executeFunction from 'network/executeFunction'
import { FeatureFlags } from '../types'

const store = new Store(new RecordSource())
// @ts-ignore fixme
const network = Network.create(executeFunction)

const getDataID = (fieldValue: Record<string, unknown>, typeName: string) => {
  const id = fieldValue.id
  if ((typeName === 'SiteColor' || typeName === 'SiteImage') && typeof id === 'string') {
    return `${typeName}:${id}`
  }
  return typeof id === 'string' ? id : null
}

export const environment = new Environment({
  network,
  store,
  getDataID,
})

const getEnvironment = (featureFlags: FeatureFlags) => {
  commitLocalUpdate(environment, storeProxy => {
    if (storeProxy.get(`client:root:featureFlags:shield_mode`) !== undefined) {
      // If features flags are already set, we don't need to do anything.
      return
    }
    const newFeatureFlagsRecords = Object.keys(featureFlags).map(key => {
      const enabled = featureFlags[key]
      const newRecord = storeProxy.create(`client:root:featureFlags:${key}`, 'FeatureFlag')
      newRecord.setValue(enabled, 'enabled')
      newRecord.setValue(key, 'type')
      return newRecord
    })
    storeProxy.getRoot().setLinkedRecords(newFeatureFlagsRecords, 'featureFlags')
  })

  return environment
}

export default getEnvironment
