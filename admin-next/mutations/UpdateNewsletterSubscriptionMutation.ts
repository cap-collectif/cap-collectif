import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateNewsletterSubscriptionMutation,
  UpdateNewsletterSubscriptionMutation$data,
  UpdateNewsletterSubscriptionMutation$variables,
} from '@relay/UpdateNewsletterSubscriptionMutation.graphql'

const mutation = graphql`
  mutation UpdateNewsletterSubscriptionMutation($input: UpdateNewsletterSubscriptionInput!) {
    updateNewsletterSubscription(input: $input) {
      newsletterSubscription {
        id
        ...NewsletterSubscriptionItem_newsletterSubscription
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: UpdateNewsletterSubscriptionMutation$variables,
): Promise<UpdateNewsletterSubscriptionMutation$data> =>
  commitMutation<UpdateNewsletterSubscriptionMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
