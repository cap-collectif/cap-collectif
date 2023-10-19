// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  DeleteMediaAdminMutationVariables,
  DeleteMediaAdminMutationResponse,
} from '~relay/DeleteMediaAdminMutation.graphql'

const mutation = graphql`
  mutation DeleteMediaAdminMutation($input: DeleteMediaAdminInput!) {
    deleteMediaAdmin(input: $input) {
      deletedMediaIds
    }
  }
`

const commit = (variables: DeleteMediaAdminMutationVariables): Promise<DeleteMediaAdminMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
