import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  AddOtherStepMutation,
  AddOtherStepMutation$variables,
  AddOtherStepMutation$data,
} from '@relay/AddOtherStepMutation.graphql'

const mutation = graphql`
  mutation AddOtherStepMutation($input: AddStepInput!) {
    addOtherStep(input: $input) {
      step {
        adminUrl(operationType: CREATE)
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: AddOtherStepMutation$variables): Promise<AddOtherStepMutation$data> =>
  commitMutation<AddOtherStepMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
