// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UpdateUserReplyMutationVariables,
  UpdateUserReplyMutationResponse,
} from '~relay/UpdateUserReplyMutation.graphql'

const mutation = graphql`
  mutation UpdateUserReplyMutation($input: UpdateUserReplyInput!) {
    updateUserReply(input: $input) {
      reply {
        id
        requirementsUrl
        ...ReplyForm_reply
        ...ReplyLink_reply
      }
      errorCode
    }
  }
`

const commit = (variables: UpdateUserReplyMutationVariables): Promise<UpdateUserReplyMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
