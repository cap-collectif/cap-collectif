import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  AddQuestionnaireStepMutation,
  AddQuestionnaireStepMutation$variables,
  AddQuestionnaireStepMutation$data,
} from '@relay/AddQuestionnaireStepMutation.graphql'

const mutation = graphql`
  mutation AddQuestionnaireStepMutation($input: AddStepInput!) {
    addQuestionnaireStep(input: $input) {
      step {
        adminUrl(operationType: CREATE)
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: AddQuestionnaireStepMutation$variables): Promise<AddQuestionnaireStepMutation$data> =>
  commitMutation<AddQuestionnaireStepMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
