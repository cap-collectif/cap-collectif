import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateNewsletterSubscriptionMutation,
  CreateNewsletterSubscriptionMutation$data,
  CreateNewsletterSubscriptionMutation$variables,
} from '@relay/CreateNewsletterSubscriptionMutation.graphql'

const mutation = graphql`
  mutation CreateNewsletterSubscriptionMutation($input: CreateNewsletterSubscriptionInput!, $connections: [ID!]!) {
    createNewsletterSubscription(input: $input) {
      newsletterSubscription @prependNode(connections: $connections, edgeTypeName: "NewsletterSubscriptionEdge") {
        id
        ...NewsletterSubscriptionItem_newsletterSubscription
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: CreateNewsletterSubscriptionMutation$variables,
): Promise<CreateNewsletterSubscriptionMutation$data> =>
  commitMutation<CreateNewsletterSubscriptionMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
