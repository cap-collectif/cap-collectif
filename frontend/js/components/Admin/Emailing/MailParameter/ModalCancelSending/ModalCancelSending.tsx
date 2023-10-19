import * as React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import { Modal } from 'react-bootstrap'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import { Container, ButtonConfirmation } from './ModalCancelSending.style'
import colors from '~/utils/colors'
import CancelEmailingCampaignMutation from '~/mutations/CancelEmailingCampaignMutation'
import FluxDispatcher from '~/dispatchers/AppDispatcher'
import { TYPE_ALERT, UPDATE_ALERT } from '~/constants/AlertConstants'
import type { ModalCancelSending_emailingCampaign } from '~relay/ModalCancelSending_emailingCampaign.graphql'
import '~relay/ModalCancelSending_emailingCampaign.graphql'

type Props = {
  show: boolean
  onClose: () => void
  emailingCampaign: ModalCancelSending_emailingCampaign
}

const cancelSending = (id: string, onClose: () => void) => {
  return CancelEmailingCampaignMutation.commit({
    input: {
      id,
    },
  })
    .then(response => {
      if (response.cancelEmailingCampaign?.error) {
        onClose()
        return FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: {
            type: TYPE_ALERT.ERROR,
            content: 'global.error.server.form',
          },
        })
      }

      onClose()
      return FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          type: TYPE_ALERT.SUCCESS,
          content: 'success-cancel-emailing-campaign',
          values: {
            title: response?.cancelEmailingCampaign?.emailingCampaign?.name,
          },
        },
      })
    })
    .catch(() => {
      return FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          type: TYPE_ALERT.ERROR,
          content: 'global.error.server.form',
        },
      })
    })
}

export const ModalCancelSending = ({ show, onClose, emailingCampaign }: Props) => (
  <Container animation={false} show={show} onHide={onClose} bsSize="small" aria-labelledby="modal-title">
    <Modal.Header closeButton>
      <Modal.Title id="modal-title">
        <FormattedMessage id="title-modal-confirmation-cancel-sending" />
      </Modal.Title>
    </Modal.Header>

    <Modal.Body>
      <p>
        <Icon name={ICON_NAME.danger} size={14} color={colors.dangerColor} />
        <FormattedMessage id="global-action-irreversible" />
      </p>
    </Modal.Body>

    <Modal.Footer>
      <ButtonConfirmation type="button" onClick={() => cancelSending(emailingCampaign.id, onClose)}>
        <FormattedMessage id="cancel-definitely" />
      </ButtonConfirmation>
    </Modal.Footer>
  </Container>
)
export default createFragmentContainer(ModalCancelSending, {
  emailingCampaign: graphql`
    fragment ModalCancelSending_emailingCampaign on EmailingCampaign {
      id
      status
    }
  `,
})
