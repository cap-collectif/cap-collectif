import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  AddCollectStepMutation,
  AddCollectStepMutation$variables,
  AddCollectStepMutation$data,
} from '@relay/AddCollectStepMutation.graphql'

const mutation = graphql`
  mutation AddCollectStepMutation($input: AddStepInput!) {
    addCollectStep(input: $input) {
      step {
        adminUrl(operationType: CREATE)
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: AddCollectStepMutation$variables): Promise<AddCollectStepMutation$data> =>
  commitMutation<AddCollectStepMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
