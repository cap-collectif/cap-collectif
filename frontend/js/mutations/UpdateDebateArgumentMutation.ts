// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UpdateDebateArgumentMutationVariables,
  UpdateDebateArgumentMutationResponse,
} from '~relay/UpdateDebateArgumentMutation.graphql'

const mutation = graphql`
  mutation UpdateDebateArgumentMutation($input: UpdateDebateArgumentInput!) {
    updateDebateArgument(input: $input) {
      errorCode
      debateArgument {
        debate {
          id
        }
        author {
          id
        }
        body
        type
      }
    }
  }
`

const commit = (variables: UpdateDebateArgumentMutationVariables): Promise<UpdateDebateArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
