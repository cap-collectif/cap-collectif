import * as React from 'react'
import { useIntl } from 'react-intl'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { Button, CapUIModalSize, Heading, Modal } from '@cap-collectif/ui'
import { useDisclosure } from '@liinkiing/react-hooks'
import { useEventListener } from '@shared/hooks/useEventListener'
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay'
import { ChartModalQuery as Query } from '@relay/ChartModalQuery.graphql'
import { ChartModal_query$key } from '@relay/ChartModal_query.graphql'

export const openChartModal = 'openChartModal'

export const FRAGMENT = graphql`
  fragment ChartModal_query on Query {
    siteParameter(keyname: "charter.body") {
      value
    }
  }
`

export const QUERY = graphql`
  query ChartModalQuery {
    ...ChartModal_query
  }
`

export const ChartModal: React.FC<{ query: ChartModal_query$key }> = ({ query: queryKey }) => {
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const query = useFragment(FRAGMENT, queryKey)

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

export const ChartModalQuery: React.FC = () => {
  const query = useLazyLoadQuery<Query>(QUERY, {})

  return <ChartModal query={query} />
}

export default ChartModal
