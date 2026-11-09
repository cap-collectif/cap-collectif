import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateOpinionAdminMutation,
  UpdateOpinionAdminMutation$data,
  UpdateOpinionAdminMutation$variables,
} from '@relay/UpdateOpinionAdminMutation.graphql'

// The payload refreshes the edited opinion in the store, so the form shows the saved values
const mutation = graphql`
  mutation UpdateOpinionAdminMutation($input: UpdateOpinionAdminInput!) {
    updateOpinionAdmin(input: $input) {
      opinion {
        ...OpinionFormWrapper_opinion
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateOpinionAdminMutation$variables): Promise<UpdateOpinionAdminMutation$data> =>
  commitMutation<UpdateOpinionAdminMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
