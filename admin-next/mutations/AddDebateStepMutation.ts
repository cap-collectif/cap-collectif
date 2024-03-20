import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  AddDebateStepMutation,
  AddDebateStepMutation$variables,
  AddDebateStepMutation$data,
} from '@relay/AddDebateStepMutation.graphql'

const mutation = graphql`
  mutation AddDebateStepMutation($input: AddStepInput!) {
    addDebateStep(input: $input) {
      step {
        adminUrl(operationType: CREATE)
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: AddDebateStepMutation$variables): Promise<AddDebateStepMutation$data> =>
  commitMutation<AddDebateStepMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
