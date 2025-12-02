import { Button, ButtonGroup, CapUIModalSize, Checkbox, Heading, headingStyles, Modal, Text } from '@cap-collectif/ui'
import { DeleteCustomDomainModal_siteSettings$key } from '@relay/DeleteCustomDomainModal_siteSettings.graphql'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'

import { mutationErrorToast } from '@shared/utils/toasts'
import DeleteCustomDomainMutation from 'mutations/DeleteCustomDomainMutation'

type Props = {
  siteSettings: DeleteCustomDomainModal_siteSettings$key
  show: boolean
  onClose: () => void
  onSuccess: () => void
}

export const FRAGMENT = graphql`
  fragment DeleteCustomDomainModal_siteSettings on SiteSettings {
    capcoDomain
    customDomain
  }
`

const DeleteCustomDomainModal: React.FC<Props> = ({ siteSettings: siteSettingsFragment, show, onClose, onSuccess }) => {
  const intl = useIntl()
  const { capcoDomain, customDomain } = useFragment(FRAGMENT, siteSettingsFragment)

  const [checked, setChecked] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const closeModal = () => {
    onClose()
    setChecked(false)
  }

  const onSubmit = () => {
    setIsSubmitting(true)
    return DeleteCustomDomainMutation.commit({ input: {} })
      .then(response => {
        setChecked(false)
        setIsSubmitting(false)
        const errorCode = response.deleteCustomDomain?.errorCode
        const siteSettings = response.deleteCustomDomain?.siteSettings
        if (errorCode === 'ERROR_DEPLOYER_API') {
          closeModal()
          return mutationErrorToast(intl)
        }
        onSuccess()
        closeModal()
        if (siteSettings?.status === 'IDLE' && siteSettings?.capcoDomain) {
          window.location.href = `https://${siteSettings.capcoDomain}`
        }
      })
      .catch(() => {
        setChecked(false)
        setIsSubmitting(false)
        closeModal()
      })
  }

  return (
    <Modal ariaLabel="delete-custom-domain" size={CapUIModalSize.Md} show={show} onClose={closeModal}>
      <>
        <Modal.Header>
          <Heading color="blue.900" {...headingStyles.h2}>
            {intl.formatMessage({
              id: 'are-you-sure-you-want-to-delete-your-custom-domain-name',
            })}
          </Heading>
        </Modal.Header>
        <Modal.Body>
          <Text mb={2}>
            {intl.formatMessage(
              { id: 'custom-domain-delete-confirmation-message' },
              {
                customDomain: (
                  <Text as="span" fontWeight={600}>
                    {customDomain}
                  </Text>
                ),
                capcoDomain: (
                  <Text as="span" fontWeight={600}>
                    {capcoDomain}
                  </Text>
                ),
              },
            )}
          </Text>
          <Checkbox
            id="agree-checkbox"
            checked={checked}
            onChange={e => setChecked((e.target as HTMLInputElement).checked)}
          >
            {intl.formatMessage({ id: 'admin.project.delete.confirm' })}
          </Checkbox>
        </Modal.Body>
        <Modal.Footer spacing={2}>
          <ButtonGroup>
            <Button variantSize="medium" variant="secondary" variantColor="hierarchy" onClick={closeModal}>
              {intl.formatMessage({ id: 'cancel' })}
            </Button>
            <Button
              onClick={() => onSubmit()}
              variantSize="medium"
              variant="primary"
              variantColor="danger"
              isLoading={isSubmitting}
              disabled={!checked || isSubmitting}
            >
              {intl.formatMessage({ id: 'global.delete' })}
            </Button>
          </ButtonGroup>
        </Modal.Footer>
      </>
    </Modal>
  )
}

export default DeleteCustomDomainModal
