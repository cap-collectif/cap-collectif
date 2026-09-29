import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteNewsletterSubscriptionMutation,
  DeleteNewsletterSubscriptionMutation$data,
  DeleteNewsletterSubscriptionMutation$variables,
} from '@relay/DeleteNewsletterSubscriptionMutation.graphql'

const mutation = graphql`
  mutation DeleteNewsletterSubscriptionMutation($input: DeleteNewsletterSubscriptionInput!, $connections: [ID!]!) {
    deleteNewsletterSubscription(input: $input) {
      deletedNewsletterSubscriptionId @deleteEdge(connections: $connections)
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: DeleteNewsletterSubscriptionMutation$variables,
): Promise<DeleteNewsletterSubscriptionMutation$data> =>
  commitMutation<DeleteNewsletterSubscriptionMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
