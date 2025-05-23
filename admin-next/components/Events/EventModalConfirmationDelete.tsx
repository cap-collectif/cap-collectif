import * as React from 'react'
import { useIntl, IntlShape } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import {
  Button,
  ButtonGroup,
  ButtonQuickAction,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Heading,
  Modal,
  Text,
  toast,
} from '@cap-collectif/ui'
import DeleteEventMutation from 'mutations/DeleteEventMutation'
import type { EventModalConfirmationDelete_event$key } from '@relay/EventModalConfirmationDelete_event.graphql'
import { EventAffiliations } from './EventList'
import { useAppContext } from '@components/AppProvider/App.context'

type Props = {
  disclosure?: React.ReactNode
  onDelete?: () => void
}

const FRAGMENT = graphql`
  fragment EventModalConfirmationDelete_event on Event {
    id
    title
  }
`

const deleteEvent = (
  eventId: string,
  hide: () => void,
  intl: IntlShape,
  affiliations: EventAffiliations,
  onDelete?: () => void,
) => {
  const input = {
    eventId,
  }
  hide()
  return DeleteEventMutation.commit({ input, affiliations })
    .then(() => {
      toast({
        variant: 'success',
        content: intl.formatMessage({ id: 'event-successfully-deleted' }),
      })
      if (onDelete) onDelete()
    })
    .catch(() => mutationErrorToast(intl))
}

export const EventModalConfirmationDelete: React.FC<Props & { id: string; title: string }> = ({
  id,
  title,
  disclosure,
  onDelete,
}) => {
  const { viewerSession } = useAppContext()

  const affiliations: EventAffiliations = viewerSession?.isAdmin ? null : ['OWNER']

  const intl = useIntl()
  return (
    <Modal
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
      disclosure={
        disclosure ?? (
          <ButtonQuickAction
            icon={CapUIIcon.Trash}
            size={CapUIIconSize.Md}
            variantColor="danger"
            label={intl.formatMessage({ id: 'global.delete' })}
          />
        )
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'delete-confirmation' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>{intl.formatMessage({ id: 'are-you-sure-to-delete-something' }, { element: title })}</Text>
          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button variantSize="medium" variant="secondary" variantColor="hierarchy" onClick={hide}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <Button
                id="delete-event-confirm"
                variantSize="medium"
                variant="primary"
                variantColor="danger"
                onClick={() => deleteEvent(id, hide, intl, affiliations, onDelete)}
              >
                {intl.formatMessage({ id: 'global.delete' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

const EventModalConfirmationDeleteQuery: React.FC<Props & { event: EventModalConfirmationDelete_event$key }> = ({
  event: eventFragment,
  disclosure,
}) => {
  const event = useFragment(FRAGMENT, eventFragment)

  return <EventModalConfirmationDelete {...event} disclosure={disclosure} />
}

export default EventModalConfirmationDeleteQuery
