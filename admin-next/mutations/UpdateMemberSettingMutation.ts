import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import type { UpdateMemberSettingMutation as Mutation } from '@relay/UpdateMemberSettingMutation.graphql'

const mutation = graphql`
  mutation UpdateMemberSettingMutation($input: UpdateMemberSettingInput!) {
    updateMemberSetting(input: $input) {
      siteParameter { id value isEnabled translations { locale value } }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: Mutation['variables']) =>
  new Promise<Mutation['response']>((resolve, reject) =>
    commitMutation<Mutation>(environment, { mutation, variables }).then(resolve, reject),
  )

export default { commit }
