import type { FC } from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import { Modal, Heading, InfoMessage, CapUIModalSize } from '@cap-collectif/ui'
import type { ModalSectionVisitors_visitors$key } from '@relay/ModalSectionVisitors_visitors.graphql'
import LineChart from '@ui/Charts/LineChart/LineChart'
import formatValues from '../../formatValues'
import ProjectPeriod from '../../ProjectPeriod'

interface ModalSectionVisitorsProps {
  show: boolean
  onClose: () => void
  visitors: ModalSectionVisitors_visitors$key
}

const FRAGMENT = graphql`
  fragment ModalSectionVisitors_visitors on PlatformAnalyticsVisitors {
    totalCount
    values {
      key
      totalCount
    }
  }
`

const ModalSectionVisitors: FC<ModalSectionVisitorsProps> = ({ show, onClose, visitors: visitorsFragment }) => {
  const visitors = useFragment(FRAGMENT, visitorsFragment)
  const intl = useIntl()

  return (
    <Modal
      show={show}
      onClose={onClose}
      ariaLabel={intl.formatMessage({ id: 'global.visitor.dynamic' }, { num: visitors.totalCount })}
      size={CapUIModalSize.Lg}
    >
      <Modal.Header>
        <Heading as="h4" color="blue.900">
          {visitors.totalCount} {intl.formatMessage({ id: 'global.visitor.dynamic' }, { num: visitors.totalCount })}
        </Heading>
      </Modal.Header>
      <Modal.Body spacing={5}>
        <ProjectPeriod />

        <InfoMessage variant="info">
          <InfoMessage.Title>{intl.formatMessage({ id: 'additional-information' })}</InfoMessage.Title>
          <InfoMessage.Content>{intl.formatMessage({ id: 'definition-visitor-word' })}</InfoMessage.Content>
        </InfoMessage>

        <LineChart
          data={formatValues(visitors.values, intl)}
          label={intl.formatMessage({ id: 'global.visitor.dynamic' }, { num: visitors.totalCount })}
          height="270px"
          withAxis
          withGrid
        />
      </Modal.Body>
    </Modal>
  )
}

export default ModalSectionVisitors
