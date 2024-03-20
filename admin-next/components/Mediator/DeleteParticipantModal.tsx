import React from 'react'
import { Button, ButtonQuickAction, CapUIIcon, CapUIModalSize, Heading, Modal, Text, toast } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import DeleteParticipantMutation from '@mutations/DeleteParticipantMutation'
import { graphql, useFragment } from 'react-relay'
import { mutationErrorToast } from '../../utils/mutation-error-toast'

export const mediatorFragment = graphql`
  fragment DeleteParticipantModal_mediator on Mediator {
    id
  }
`
export const participantFragment = graphql`
  fragment DeleteParticipantModal_participant on Participant {
    token
  }
`

const DeleteParticipantModal = ({ mediator: mediatorRef, participant: participantRef, connection }) => {
  const intl = useIntl()
  const mediator = useFragment(mediatorFragment, mediatorRef)
  const participant = useFragment(participantFragment, participantRef)

  const onDelete = async (hide: () => void) => {
    try {
      await DeleteParticipantMutation.commit({
        connections: [connection],
        input: {
          mediatorId: mediator.id,
          participantToken: participant.token,
        },
      })
      toast({
        variant: 'success',
        content: intl.formatMessage({
          id: 'participant-deleted-successfully',
        }),
      })
      hide()
    } catch (error) {
      return mutationErrorToast(intl)
    }
  }

  return (
    <Modal
      scrollBehavior="inside"
      ariaLabel={intl.formatMessage({
        id: 'delete-reply-modal',
      })}
      disclosure={
        <ButtonQuickAction
          variantColor="red"
          icon={CapUIIcon.Trash}
          label={intl.formatMessage({ id: 'global.remove' })}
        />
      }
      size={CapUIModalSize.Lg}
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>
              {intl.formatMessage({
                id: 'delete-confirmation',
              })}
            </Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>
              {intl.formatMessage({
                id: 'participant.delete.confirm',
              })}
            </Text>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <Button onClick={hide} variantSize="small" variant="secondary" variantColor="hierarchy" color="gray.400">
              {intl.formatMessage({
                id: 'global.cancel',
              })}
            </Button>
            <Button variantSize="small" variant="primary" variantColor="danger" onClick={() => onDelete(hide)}>
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

export default DeleteParticipantModal
