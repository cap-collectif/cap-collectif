// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  SelectSenderEmailMutationVariables,
  SelectSenderEmailMutationResponse,
} from '~relay/SelectSenderEmailMutation.graphql'

const mutation = graphql`
  mutation SelectSenderEmailMutation($input: SelectSenderEmailInput!) {
    selectSenderEmail(input: $input) {
      errorCode
      senderEmail {
        id
        address
      }
    }
  }
`

const commit = (variables: SelectSenderEmailMutationVariables): Promise<SelectSenderEmailMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
