import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  AddVoteAndSelectionStepMutation,
  AddVoteAndSelectionStepMutation$variables,
  AddVoteAndSelectionStepMutation$data,
} from '@relay/AddVoteAndSelectionStepMutation.graphql'

const mutation = graphql`
  mutation AddVoteAndSelectionStepMutation($input: AddStepInput!) {
    addVoteAndSelectionStep(input: $input) {
      step {
        adminUrl(operationType: CREATE)
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: AddVoteAndSelectionStepMutation$variables): Promise<AddVoteAndSelectionStepMutation$data> =>
  commitMutation<AddVoteAndSelectionStepMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
