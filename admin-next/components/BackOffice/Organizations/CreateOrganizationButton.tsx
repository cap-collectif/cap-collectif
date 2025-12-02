import { CapUIFontWeight, CapUIIcon, Icon, Text } from '@cap-collectif/ui'
import AddOrganizationMutation from '@mutations/AddOrganizationMutation'
import { mutationErrorToast } from '@shared/utils/toasts'
import * as React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'

export interface CreateOrganizationButtonProps {}

const CreateButton = styled.button`
  border: 1px dashed #dadee1;
  height: 172px;
  width: 226px;
  color: #1a88ff;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  margin-right: 16px;
  margin-bottom: 16px;
  &:hover {
    border-color: #0051a8;
    color: #0051a8;
  }
`

const CreateOrganizationButton: React.FC<CreateOrganizationButtonProps> = () => {
  const intl = useIntl()
  return (
    <CreateButton
      type="button"
      onClick={async () => {
        try {
          const response = await AddOrganizationMutation.commit({
            input: {
              translations: [
                {
                  title: intl.formatMessage({ id: 'organisation.create.default.name' }),
                  locale: 'FR_FR',
                },
              ],
            },
          })
          if (response?.addOrganization) {
            window.open(`/admin-next/organization-config/${response.addOrganization.organization?.id}`, '_self')
          }
        } catch (e) {
          console.error(e)
          mutationErrorToast(intl)
        }
      }}
    >
      <Icon name={CapUIIcon.Add} />
      <Text fontWeight={CapUIFontWeight.Semibold}>{intl.formatMessage({ id: 'admin.create.organization' })}</Text>
    </CreateButton>
  )
}

export default CreateOrganizationButton
