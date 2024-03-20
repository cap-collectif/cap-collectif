import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateDebateOpinionMutation$variables,
  UpdateDebateOpinionMutation$data,
  UpdateDebateOpinionMutation,
} from '@relay/UpdateDebateOpinionMutation.graphql'

const mutation = graphql`
  mutation UpdateDebateOpinionMutation($input: UpdateDebateOpinionInput!) {
    updateDebateOpinion(input: $input) {
      errorCode
      debateOpinion {
        ...DebateOpinion_debateOpinion
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateDebateOpinionMutation$variables): Promise<UpdateDebateOpinionMutation$data> =>
  commitMutation<UpdateDebateOpinionMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
