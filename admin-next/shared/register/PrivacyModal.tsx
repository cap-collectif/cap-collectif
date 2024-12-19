import React, { FC } from 'react'
import { useDisclosure } from '@liinkiing/react-hooks'
import { useIntl } from 'react-intl'
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay'
import { PrivacyModalQuery as Query } from '@relay/PrivacyModalQuery.graphql'
import { PrivacyModal_query$key } from '@relay/PrivacyModal_query.graphql'

import { Button, CapUIModalSize, Heading, Modal } from '@cap-collectif/ui'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { useEventListener } from '@shared/hooks/useEventListener'

export const openPrivacyModal = 'openPrivacyModal'

export const FRAGMENT = graphql`
  fragment PrivacyModal_query on Query {
    privacy: siteParameter(keyname: "privacy-policy") {
      value
    }
  }
`

export const QUERY = graphql`
  query PrivacyModalQuery {
    ...PrivacyModal_query
  }
`

export const PrivacyModal: FC<{ query: PrivacyModal_query$key }> = ({ query: queryKey }) => {
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const query = useFragment(FRAGMENT, queryKey)
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
        <WYSIWYGRender value={query.privacy.value} />
      </Modal.Body>
      <Modal.Footer className="privacy-policy">
        <Button variantSize="big" variant="secondary" onClick={onClose}>
          {intl.formatMessage({ id: 'global.close' })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export const PrivacyModalQuery: React.FC = () => {
  const query = useLazyLoadQuery<Query>(QUERY, {})

  return <PrivacyModal query={query} />
}

export default PrivacyModalQuery
