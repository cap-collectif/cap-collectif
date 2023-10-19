// @ts-nocheck
import type { Environment } from 'react-relay'
import { commitMutation as relayCommitMutation } from 'react-relay'

const commitMutation = (environment: Environment, config: ReactRelayMutationConfig<any>): Promise<any> =>
  new Promise((resolve, reject) => {
    relayCommitMutation(environment, {
      ...config,
      // Callback function executed when the request is completed and the in-memory Relay store is updated with the updater function.
      // Takes a response object, which is the "raw" server response, and errors, an array containing any errors from the server.
      onCompleted: (response: Record<string, any> | null | undefined, errors) => {
        if (errors) {
          return reject(errors[0])
        }

        return resolve(response)
      },
      // Callback function executed if Relay encounters an error during the request.
      onError: (error: Error) => reject(error),
    })
  })

export default commitMutation
