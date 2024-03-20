import * as React from 'react'
import { useIntl, IntlShape } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { mutationErrorToast } from 'utils/mutation-error-toast'
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

type Props = {
  event: EventModalConfirmationDelete_event$key
  affiliations: EventAffiliations
}

const FRAGMENT = graphql`
  fragment EventModalConfirmationDelete_event on Event {
    id
    title
  }
`

const deleteEvent = (eventId: string, hide: () => void, intl: IntlShape, affiliations: EventAffiliations) => {
  const input = {
    eventId,
  }
  hide()
  return DeleteEventMutation.commit({ input, affiliations })
    .then(() =>
      toast({
        variant: 'success',
        content: intl.formatMessage({ id: 'event-successfully-deleted' }),
      }),
    )
    .catch(() => mutationErrorToast(intl))
}

const EventModalConfirmationDelete: React.FC<Props> = ({ event: eventFragment, affiliations }) => {
  const event = useFragment(FRAGMENT, eventFragment)
  const intl = useIntl()
  return (
    <Modal
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
      disclosure={
        <ButtonQuickAction
          icon={CapUIIcon.Trash}
          size={CapUIIconSize.Md}
          variantColor="red"
          label={intl.formatMessage({ id: 'global.delete' })}
        />
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'delete-confirmation' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>{intl.formatMessage({ id: 'are-you-sure-to-delete-something' }, { element: event.title })}</Text>
          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button variantSize="medium" variant="secondary" variantColor="hierarchy" onClick={hide}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <Button
                variantSize="medium"
                variant="primary"
                variantColor="danger"
                onClick={() => deleteEvent(event.id, hide, intl, affiliations)}
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

export default EventModalConfirmationDelete
