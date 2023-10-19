// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  CreateProposalAnalysisCommentMutationVariables,
  CreateProposalAnalysisCommentMutationResponse,
} from '~relay/CreateProposalAnalysisCommentMutation.graphql'

const mutation = graphql`
  mutation CreateProposalAnalysisCommentMutation($input: CreateProposalAnalysisCommentInput!, $connections: [ID!]!) {
    createProposalAnalysisComment(input: $input) {
      comment @prependNode(connections: $connections, edgeTypeName: "CommentEdge") {
        id
        body
        createdAt
        author {
          ...UserAvatar_user
          username
        }
      }
    }
  }
`

const commit = (
  variables: CreateProposalAnalysisCommentMutationVariables,
): Promise<CreateProposalAnalysisCommentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
