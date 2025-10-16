/* eslint-disable no-console */
import type { LogEvent } from 'relay-runtime'

const transactionsMap = {}

const relayTransactionLogger = (event: LogEvent) => {
  if (event.name === 'network.start') {
    const { networkRequestId, variables } = event
    const { name } = event.params
    const idName = `[${networkRequestId}] Relay Modern: ${name}`
    transactionsMap[networkRequestId] = {
      idName,
      name,
      variables,
    }
    console.time(idName)
  } else if (event.name === 'network.error') {
    const { networkRequestId, error } = event
    const { idName, name, variables } = transactionsMap[networkRequestId]
    console.groupCollapsed(`%c${idName}`, 'color:red')
    console.timeEnd(idName)
    console.log('GraphiQL:', name)
    console.log('Variables:', JSON.stringify(variables, null, 2))

    if (error) {
      console.log('Error:', error)
    }

    console.groupEnd()
  } else if (event.name === 'network.next') {
    const { networkRequestId, response } = event
    const { idName, name, variables } = transactionsMap[networkRequestId]
    console.groupCollapsed(`${idName}`)
    console.timeEnd(idName)
    console.log('GraphiQL:', name)
    console.log('Variables:', JSON.stringify(variables, null, 2))

    if (response) {
      console.log('Response:', response)
    }

    console.groupEnd()
  } else {
    console.log('RELAY: ', event)
  }
}

export default relayTransactionLogger
