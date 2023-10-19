// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UpdateProfileAccountEmailMutationVariables,
  UpdateProfileAccountEmailMutationResponse as Response,
} from '~relay/UpdateProfileAccountEmailMutation.graphql'

export type UpdateProfileAccountEmailMutationResponse = Response
const mutation = graphql`
  mutation UpdateProfileAccountEmailMutation($input: UpdateProfileAccountEmailInput!) {
    updateProfileAccountEmail(input: $input) {
      viewer {
        ...AccountForm_viewer
        ...EmailNotConfirmedAlert_viewer
        ...NewEmailNotConfirmedAlert_viewer
      }
      error
    }
  }
`

const commit = (variables: UpdateProfileAccountEmailMutationVariables): Promise<Response> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
