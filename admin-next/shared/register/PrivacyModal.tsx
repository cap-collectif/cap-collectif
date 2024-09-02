import React, { FC } from 'react'
import { useDisclosure } from '@liinkiing/react-hooks'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { PrivacyModalQuery } from '@relay/PrivacyModalQuery.graphql'
import { Button, CapUIModalSize, Heading, Modal } from '@cap-collectif/ui'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { useEventListener } from '@shared/hooks/useEventListener'

export const openPrivacyModal = 'openPrivacyModal'

export const QUERY = graphql`
  query PrivacyModalQuery {
    siteParameter(keyname: "privacy-policy") {
      value
    }
  }
`

export const PrivacyModal: FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const query = useLazyLoadQuery<PrivacyModalQuery>(QUERY, {})
  const intl = useIntl()

  useEventListener(openPrivacyModal, () => onOpen())

  if (!isOpen) return null

  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      size={CapUIModalSize.Lg}
      id="privacy-modal"
      className="privacy-policy"
      ariaLabel="contained-modal-title-lg"
    >
      <Modal.Header className="privacy-policy">
        <Heading>{intl.formatMessage({ id: 'privacy-policy' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <WYSIWYGRender value={query.siteParameter.value} />
      </Modal.Body>
      <Modal.Footer className="privacy-policy">
        <Button variantSize="big" variant="secondary" onClick={onClose}>
          {intl.formatMessage({ id: 'global.close' })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default PrivacyModal
