import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  ModerateReportingMutation,
  ModerateReportingMutation$data,
  ModerateReportingMutation$variables,
} from '@relay/ModerateReportingMutation.graphql'

const mutation = graphql`
  mutation ModerateReportingMutation($input: ModerateReportingInput!) {
    moderateReporting(input: $input) {
      reporting {
        id
        isArchived
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: ModerateReportingMutation$variables): Promise<ModerateReportingMutation$data> =>
  commitMutation<ModerateReportingMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
