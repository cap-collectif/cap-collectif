import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteFontMutation,
  DeleteFontMutation$data,
  DeleteFontMutation$variables,
} from '@relay/DeleteFontMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation DeleteFontMutation($input: DeleteFontInput!) {
    deleteFont(input: $input) {
      deletedFontId
      bodyFont {
        id
        useAsBody
      }
      headingFont {
        id
        useAsHeading
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteFontMutation$variables): Promise<DeleteFontMutation$data> =>
  commitMutation<DeleteFontMutation>(environment, { mutation, variables })

export default { commit }
