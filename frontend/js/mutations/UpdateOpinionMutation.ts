// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UpdateOpinionMutationVariables,
  UpdateOpinionMutationResponse,
} from '~relay/UpdateOpinionMutation.graphql'

const mutation = graphql`
  mutation UpdateOpinionMutation($input: UpdateOpinionInput!) {
    updateOpinion(input: $input) {
      opinion {
        url
      }
      errorCode
    }
  }
`

const commit = (variables: UpdateOpinionMutationVariables): Promise<UpdateOpinionMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
