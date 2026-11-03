import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  ChangeFontMutation,
  ChangeFontMutation$data,
  ChangeFontMutation$variables,
} from '@relay/ChangeFontMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation ChangeFontMutation($input: ChangeFontInput!) {
    changeFont(input: $input) {
      fonts {
        id
        useAsHeading
        useAsBody
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: ChangeFontMutation$variables): Promise<ChangeFontMutation$data> =>
  commitMutation<ChangeFontMutation>(environment, { mutation, variables })

export default { commit }
