import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import type {
  SendContactFormMutation$variables,
  SendContactFormMutation$data,
  SendContactFormMutation,
} from '@relay/SendContactFormMutation.graphql'
import { environment } from '@utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation SendContactFormMutation($input: SendContactFormInput!) {
    sendContactForm(input: $input) {
      contactForm {
        id
        title
        email
        body
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: SendContactFormMutation$variables): Promise<SendContactFormMutation$data> =>
  commitMutation<SendContactFormMutation>(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
