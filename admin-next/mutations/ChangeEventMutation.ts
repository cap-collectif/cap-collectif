import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import type {
  ChangeEventMutation,
  ChangeEventMutation$data,
  ChangeEventMutation$variables,
} from '@relay/ChangeEventMutation.graphql'
import { GraphQLTaggedNode } from 'relay-runtime'
import { environment } from '@utils/relay-environement'

const mutation = graphql`
  mutation ChangeEventMutation($input: ChangeEventInput!) {
    changeEvent(input: $input) {
      event {
        id
        # ...EventForm_event
      }
      userErrors {
        message
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: ChangeEventMutation$variables): Promise<ChangeEventMutation$data> =>
  commitMutation<ChangeEventMutation>(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
