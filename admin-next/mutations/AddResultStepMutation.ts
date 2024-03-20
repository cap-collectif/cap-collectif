import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  AddResultStepMutation,
  AddResultStepMutation$variables,
  AddResultStepMutation$data,
} from '@relay/AddResultStepMutation.graphql'

const mutation = graphql`
  mutation AddResultStepMutation($input: AddStepInput!) {
    addResultStep(input: $input) {
      step {
        adminUrl(operationType: CREATE)
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: AddResultStepMutation$variables): Promise<AddResultStepMutation$data> =>
  commitMutation<AddResultStepMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
