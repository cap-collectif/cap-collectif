import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  AddEventsMutation,
  AddEventsMutation$variables,
  AddEventsMutation$data,
} from '@relay/AddEventsMutation.graphql'

const mutation = graphql`
  mutation AddEventsMutation($input: AddEventsInput!) {
    addEvents(input: $input) {
      importedEvents {
        id
      }
      notFoundEmails
      notFoundThemes
      notFoundProjects
      notFoundDistricts
      brokenDates
    }
  }
` as GraphQLTaggedNode

const commit = (variables: AddEventsMutation$variables): Promise<AddEventsMutation$data> =>
  commitMutation<AddEventsMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
