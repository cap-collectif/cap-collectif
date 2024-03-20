import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateShieldAdminFormMutation,
  UpdateShieldAdminFormMutation$data,
  UpdateShieldAdminFormMutation$variables,
} from '@relay/UpdateShieldAdminFormMutation.graphql'
import { ShieldQuery$data } from '@relay/ShieldQuery.graphql'

const mutation = graphql`
  mutation UpdateShieldAdminFormMutation($input: UpdateShieldAdminFormInput!) @raw_response_type {
    updateShieldAdminForm(input: $input) {
      shieldAdminForm {
        shieldMode
        translations {
          locale
          introduction
        }
        media {
          id
          name
          size
          type: contentType
          url(format: "reference")
        }
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateShieldAdminFormMutation$variables): Promise<UpdateShieldAdminFormMutation$data> =>
  commitMutation<UpdateShieldAdminFormMutation>(environment, {
    mutation,
    variables,
    optimisticUpdater: store => {
      const rootFields = store.getRoot()
      const shieldAdminForm = rootFields.getLinkedRecord('shieldAdminForm')
      if (!shieldAdminForm) return

      shieldAdminForm.setValue(variables.input.shieldMode, 'shieldMode')
    },
    updater: store => {
      const payload = store.getRootField('updateShieldAdminForm')
      if (!payload) return

      const rootFields = store.getRoot()
      const shieldAdminForm = rootFields.getLinkedRecord('shieldAdminForm')
      if (!shieldAdminForm) return

      const newShieldAdminForm = payload.getLinkedRecord('shieldAdminForm')
      const newTranslations = newShieldAdminForm.getLinkedRecords('translations')
      const newShieldMode = newShieldAdminForm.getValue('shieldMode')

      shieldAdminForm.setValue(newShieldMode, 'shieldMode')
      shieldAdminForm.setLinkedRecords(newTranslations, 'translations')
    },
  })

export const toggleShield = (
  enabled: boolean,
  translations: ShieldQuery$data['shieldAdminForm']['translations'],
  mediaId?: string,
) => {
  return commit({
    input: {
      shieldMode: enabled,
      // @ts-ignore
      translations,
      mediaId: mediaId || null,
    },
  })
}

export default { commit }
