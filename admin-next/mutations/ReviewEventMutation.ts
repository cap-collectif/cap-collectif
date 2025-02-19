import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from '@utils/relay-environement'
import {
  ReviewEventMutation,
  ReviewEventMutation$data,
  ReviewEventMutation$variables,
} from '@relay/ReviewEventMutation.graphql'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation ReviewEventMutation($input: ReviewEventInput!) {
    reviewEvent(input: $input) {
      event {
        id
        review {
          status
          comment
          refusedReason
        }
      }
      userErrors {
        message
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: ReviewEventMutation$variables): Promise<ReviewEventMutation$data> =>
  commitMutation<ReviewEventMutation>(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
