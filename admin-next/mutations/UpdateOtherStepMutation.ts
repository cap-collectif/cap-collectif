import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateOtherStepMutation,
  UpdateOtherStepMutation$variables,
  UpdateOtherStepMutation$data,
} from '@relay/UpdateOtherStepMutation.graphql'

const mutation = graphql`
  mutation UpdateOtherStepMutation($input: UpdateOtherStepInput!) {
    updateOtherStep(input: $input) {
      step {
        adminUrl
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateOtherStepMutation$variables): Promise<UpdateOtherStepMutation$data> =>
  commitMutation<UpdateOtherStepMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
