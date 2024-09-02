import * as React from 'react'
import { useIntl } from 'react-intl'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { Button, CapUIModalSize, Heading, Modal } from '@cap-collectif/ui'
import { useDisclosure } from '@liinkiing/react-hooks'
import { useEventListener } from '@shared/hooks/useEventListener'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { ChartModalQuery } from '@relay/ChartModalQuery.graphql'

export const openChartModal = 'openChartModal'

export const QUERY = graphql`
  query ChartModalQuery {
    siteParameter(keyname: "charter.body") {
      value
    }
  }
`

export const ChartModal: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const query = useLazyLoadQuery<ChartModalQuery>(QUERY, {})

  useEventListener(openChartModal, () => onOpen())

  const intl = useIntl()

  if (!isOpen) return null

  return (
    <Modal size={CapUIModalSize.Md} show={isOpen} onClose={onClose} ariaLabel="contained-modal-title-lg">
      <Modal.Header>
        <Heading as="h4">{intl.formatMessage({ id: 'charter' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <WYSIWYGRender value={query.siteParameter.value} />
      </Modal.Body>
      <Modal.Footer>
        <Button variantSize="big" variant="secondary" onClick={onClose}>
          {intl.formatMessage({ id: 'global.close' })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ChartModal
