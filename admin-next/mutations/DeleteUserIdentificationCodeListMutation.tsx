import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import type {
  DeleteUserIdentificationCodeListMutation,
  DeleteUserIdentificationCodeListMutation$data,
  DeleteUserIdentificationCodeListMutation$variables,
} from '@relay/DeleteUserIdentificationCodeListMutation.graphql'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
const mutation = graphql`
  mutation DeleteUserIdentificationCodeListMutation($input: DeleteUserIdentificationCodeListInput!) @raw_response_type {
    deleteUserIdentificationCodeList(input: $input) {
      deletedUserIdentificationCodeListId @deleteRecord
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: DeleteUserIdentificationCodeListMutation$variables,
): Promise<DeleteUserIdentificationCodeListMutation$data> => {
  return commitMutation<DeleteUserIdentificationCodeListMutation>(environment, {
    mutation,
    variables,
    optimisticResponse: {
      deleteUserIdentificationCodeList: {
        deletedUserIdentificationCodeListId: variables.input.id,
        errorCode: null,
      },
    },
    optimisticUpdater: store => {
      const rootFields = store.getRoot()
      const viewer = rootFields.getLinkedRecord('viewer')
      if (!viewer) return

      const userIdentificationCodeLists = viewer.getLinkedRecord('userIdentificationCodeLists', { first: 100 })
      if (!userIdentificationCodeLists) return

      const totalCount = Number(userIdentificationCodeLists.getValue('totalCount'))
      userIdentificationCodeLists.setValue(totalCount - 1, 'totalCount')
    },
    updater: store => {
      const payload = store.getRootField('deleteUserIdentificationCodeList')
      if (!payload) return
      const errorCode = payload.getValue('errorCode')
      if (errorCode) return

      const rootFields = store.getRoot()
      const viewer = rootFields.getLinkedRecord('viewer')
      if (!viewer) return

      const userIdentificationCodeLists = viewer.getLinkedRecord('userIdentificationCodeLists', { first: 100 })
      if (!userIdentificationCodeLists) return

      const totalCount = Number(userIdentificationCodeLists.getValue('totalCount'))
      userIdentificationCodeLists.setValue(totalCount - 1, 'totalCount')
    },
  })
}

export default { commit }
