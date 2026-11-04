import { Button, ButtonGroup, CapUIModalSize, Heading, Modal, Text } from '@cap-collectif/ui'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { ACTION_LABEL, ReportingAction, useModerateReporting } from './useModerateReporting'

export type ConfirmableReportingAction = Exclude<ReportingAction, 'ARCHIVE'>

const CONFIRMATION_MESSAGE: Record<ConfirmableReportingAction, string> = {
  TRASH: 'admin.action.recent_contributions.trash.message',
  DISABLE: 'admin.action.recent_contributions.unpublish.message',
}

type Props = {
  reportingId: string
  action: ConfirmableReportingAction
  contributionLabel: string
  onClose: () => void
}

// Both actions notify the contribution author by e-mail: they are confirmed before being applied
const ModerateReportingConfirmationModal: React.FC<Props> = ({ reportingId, action, contributionLabel, onClose }) => {
  const intl = useIntl()
  const { moderate, pendingAction } = useModerateReporting()
  const title = intl.formatMessage({ id: ACTION_LABEL[action] })

  const onConfirm = async () => {
    if (await moderate(reportingId, action)) onClose()
  }

  return (
    <Modal show size={CapUIModalSize.Md} ariaLabel={title} onClose={onClose}>
      <Modal.Header>
        <Heading>{title}</Heading>
      </Modal.Header>
      <Modal.Body>
        <Text>{intl.formatMessage({ id: CONFIRMATION_MESSAGE[action] })}</Text>
        <Text fontWeight={600} truncate={200}>
          {contributionLabel}
        </Text>
      </Modal.Body>
      <Modal.Footer>
        <ButtonGroup>
          <Button variantSize="big" variant="secondary" variantColor="hierarchy" onClick={onClose}>
            {intl.formatMessage({ id: 'global.cancel' })}
          </Button>
          <Button variantSize="big" variantColor="danger" isLoading={!!pendingAction} onClick={onConfirm}>
            {title}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </Modal>
  )
}

export default ModerateReportingConfirmationModal
