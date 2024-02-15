import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedHTMLMessage, FormattedMessage, useIntl } from 'react-intl'
import CloseButton from '../../Form/CloseButton'
import SubmitButton from '../../Form/SubmitButton'
import DeleteArgumentMutation from '../../../mutations/DeleteArgumentMutation'
import type { ArgumentDeleteModal_argument } from '~relay/ArgumentDeleteModal_argument.graphql'
import { toast } from '~ds/Toast'

type Props = {
  show: boolean
  argument: ArgumentDeleteModal_argument
  onClose: () => void
}

const ArgumentDeleteModal = ({ argument, onClose, show }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const intl = useIntl()

  const handleSubmit = () => {
    setIsSubmitting(true)
    return DeleteArgumentMutation.commit(
      {
        input: {
          argumentId: argument.id,
        },
      },
      argument.type,
      argument.published,
    )
      .then(response => {
        if (response.deleteArgument && response.deleteArgument.deletedArgumentId) {
          toast({ content: intl.formatMessage({ id: 'alert.success.delete.argument' }), variant: 'success' })
          onClose()
        }

        setIsSubmitting(false)
      })
      .catch(() => {
        setIsSubmitting(false)
      })
  }

  return (
    <Modal animation={false} show={show} onHide={onClose} bsSize="large" aria-labelledby="contained-modal-title-lg">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-lg">
          <FormattedMessage id="global.removeMessage" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormattedHTMLMessage id="proposal.delete.confirm" />
      </Modal.Body>
      <Modal.Footer>
        <CloseButton onClose={onClose} />
        <SubmitButton
          id="confirm-argument-delete"
          label="global.removeDefinitively"
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          bsStyle="danger"
        />
      </Modal.Footer>
    </Modal>
  )
}

export default createFragmentContainer(ArgumentDeleteModal, {
  argument: graphql`
    fragment ArgumentDeleteModal_argument on Argument {
      id
      type
      published
    }
  `,
})
