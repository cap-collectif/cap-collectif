// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UpdateAnonymousReplyMutationVariables,
  UpdateAnonymousReplyMutationResponse,
} from '~relay/UpdateAnonymousReplyMutation.graphql'

const mutation = graphql`
  mutation UpdateAnonymousReplyMutation($input: UpdateAnonymousReplyInput!) {
    updateAnonymousReply(input: $input) {
      reply {
        id
        ...ReplyForm_reply
        ...ReplyLink_reply
      }
    }
  }
`

const commit = (variables: UpdateAnonymousReplyMutationVariables): Promise<UpdateAnonymousReplyMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
