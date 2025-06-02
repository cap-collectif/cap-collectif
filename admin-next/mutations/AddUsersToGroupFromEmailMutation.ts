import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from '@utils/relay-environement'
import {
  AddUsersToGroupFromEmailMutation,
  AddUsersToGroupFromEmailMutation$data,
  AddUsersToGroupFromEmailMutation$variables,
} from '@relay/AddUsersToGroupFromEmailMutation.graphql'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation AddUsersToGroupFromEmailMutation($input: AddUsersToGroupFromEmailInput!) {
    addUsersToGroupFromEmail(input: $input) {
      importedUsers {
        id
        email
      }
      notFoundEmails
      alreadyImportedUsers {
        id
      }
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: AddUsersToGroupFromEmailMutation$variables,
): Promise<AddUsersToGroupFromEmailMutation$data> =>
  commitMutation<AddUsersToGroupFromEmailMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
