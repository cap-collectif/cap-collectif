import * as React from 'react'
import { Modal } from 'react-bootstrap'
import { FormattedMessage, FormattedHTMLMessage, IntlShape, useIntl } from 'react-intl'
import CloseButton from '~/components/Form/CloseButton'
import SubmitButton from '~/components/Form/SubmitButton'
import DeleteEmailingCampaignMutation from '~/mutations/DeleteEmailingCampaignMutation'
import type { DashboardParameters } from '~/components/Admin/Emailing/EmailingCampaign/DashboardCampaign/DashboardCampaign.reducer'
import { useDashboardCampaignContext } from '~/components/Admin/Emailing/EmailingCampaign/DashboardCampaign/DashboardCampaign.context'
import { ModalContainer } from '~/components/Admin/Emailing/MailParameter/common.style'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import { toast } from '~ds/Toast'

type Props = {
  show: boolean
  onClose: () => void
  campaignsIds: string[]
}

const deleteCampaign = (
  campaignsIds: string[],
  onClose: () => void,
  parameters: DashboardParameters,
  intl: IntlShape,
) => {
  return DeleteEmailingCampaignMutation.commit({
    input: {
      ids: campaignsIds,
    },
    parametersConnection: parameters,
  })
    .then(response => {
      if (response.deleteEmailingCampaigns?.error) {
        onClose()
        return mutationErrorToast(intl)
      }
      onClose()
      return toast({ content: intl.formatMessage({ id: 'success-delete-emailing-campaign' }), variant: 'success' })
    })
    .catch(() => {
      return mutationErrorToast(intl)
    })
}

const ModalConfirmDelete = ({ show, onClose, campaignsIds }: Props) => {
  const { parameters } = useDashboardCampaignContext()
  const intl = useIntl()

  return (
    <ModalContainer animation={false} show={show} onHide={onClose} bsSize="large" aria-labelledby="modal-title">
      <Modal.Header closeButton>
        <Modal.Title id="modal-title">
          <FormattedMessage
            id="title-delete-campaign-confirmation"
            values={{
              num: campaignsIds.length,
            }}
          />
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <FormattedHTMLMessage
          id="delete-campaign-confirmation"
          values={{
            num: campaignsIds.length,
          }}
        />
      </Modal.Body>

      <Modal.Footer>
        <CloseButton onClose={onClose} label="editor.undo" />
        <SubmitButton
          label="global.removeDefinitively"
          onSubmit={() => deleteCampaign(campaignsIds, onClose, parameters, intl)}
          bsStyle="danger"
        />
      </Modal.Footer>
    </ModalContainer>
  )
}

export default ModalConfirmDelete
