import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  AddDebateOpinionMutation$variables,
  AddDebateOpinionMutation$data,
  AddDebateOpinionMutation,
} from '@relay/AddDebateOpinionMutation.graphql'

const mutation = graphql`
  mutation AddDebateOpinionMutation($input: AddDebateOpinionInput!, $connections: [ID!]!, $edgeTypeName: String!) {
    addDebateOpinion(input: $input) {
      errorCode
      debateOpinion @appendNode(connections: $connections, edgeTypeName: $edgeTypeName) {
        ...DebateOpinion_debateOpinion
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: AddDebateOpinionMutation$variables): Promise<AddDebateOpinionMutation$data> =>
  commitMutation<AddDebateOpinionMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
