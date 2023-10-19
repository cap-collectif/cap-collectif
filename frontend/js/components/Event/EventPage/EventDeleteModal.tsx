import * as React from 'react'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'
import { Modal, Button, CapUIModalSize, Heading, toast, Checkbox, Text } from '@cap-collectif/ui'
import DeleteEventMutation from '~/mutations/DeleteEventMutation'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import ResetCss from '~/utils/ResetCss'

type Props = {
  eventId: string
  disclosure?: JSX.Element | JSX.Element[] | string
}

const onDelete = (eventId: string, intl: IntlShape) => {
  return DeleteEventMutation.commit({
    input: {
      eventId,
    },
  })
    .then(() => {
      toast({
        variant: 'success',
        content: intl.formatMessage({
          id: 'event-deleted',
        }),
      })
      window.location.href = '/events?delete=success'
    })
    .catch(() => {
      mutationErrorToast(intl)
    })
}

export const EventDeleteModal = ({ eventId, disclosure }: Props) => {
  const intl = useIntl()
  const [confirmed, setConfirmed] = React.useState(false)
  return (
    <Modal
      size={CapUIModalSize.Md}
      disclosure={
        disclosure || (
          <Button
            id="btn-delete-event"
            variantColor="danger"
            variant="secondary"
            variantSize="big"
            width={['100%', 'auto']}
            justifyContent="center"
          >
            {intl.formatMessage({
              id: 'global.delete',
            })}
          </Button>
        )
      }
    >
      {({ hide }) => (
        <>
          <ResetCss>
            <Modal.Header>
              <Heading as="h4" color="blue.900">
                {intl.formatMessage({
                  id: 'event.alert.delete',
                })}
              </Heading>
            </Modal.Header>
          </ResetCss>
          <Modal.Body>
            <Text>
              {intl.formatMessage({
                id: 'notification-send-to-all-members',
              })}
            </Text>
            <Checkbox checked={confirmed} onChange={() => setConfirmed(!confirmed)} id="confirmed-action">
              <Text fontWeight="normal">
                {intl.formatMessage({
                  id: 'admin.project.delete.confirm',
                })}
              </Text>
            </Checkbox>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={hide} variantColor="hierarchy" variant="secondary" variantSize="medium">
              {intl.formatMessage({
                id: 'global.cancel',
              })}
            </Button>
            <Button
              variantColor="danger"
              variant="primary"
              variantSize="medium"
              className="event-delete-popover-button-confirm"
              disabled={!confirmed}
              onClick={() => {
                onDelete(eventId, intl)
              }}
            >
              {intl.formatMessage({
                id: 'global.delete',
              })}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}
export default EventDeleteModal
