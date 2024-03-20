import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  AddAnalysisStepMutation,
  AddAnalysisStepMutation$variables,
  AddAnalysisStepMutation$data,
} from '@relay/AddAnalysisStepMutation.graphql'

const mutation = graphql`
  mutation AddAnalysisStepMutation($input: AddStepInput!) {
    addAnalysisStep(input: $input) {
      step {
        adminUrl(operationType: CREATE)
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: AddAnalysisStepMutation$variables): Promise<AddAnalysisStepMutation$data> =>
  commitMutation<AddAnalysisStepMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
