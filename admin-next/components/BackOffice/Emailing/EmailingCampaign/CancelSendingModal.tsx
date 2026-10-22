import * as React from 'react'
import { useIntl } from 'react-intl'
import { Button, ButtonGroup, CapUIModalSize, Heading, Modal, Text } from '@cap-collectif/ui'
import CancelEmailingCampaignMutation from '@mutations/CancelEmailingCampaignMutation'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'

type Props = {
  readonly emailingCampaignId: string
}

const CancelSendingModal: React.FC<Props> = ({ emailingCampaignId }) => {
  const intl = useIntl()
  const [isCanceling, setIsCanceling] = React.useState(false)

  const onCancel = (hide: () => void) => {
    setIsCanceling(true)

    return CancelEmailingCampaignMutation.commit({ input: { id: emailingCampaignId } })
      .then(response => {
        setIsCanceling(false)
        hide()
        if (response.cancelEmailingCampaign?.error) return mutationErrorToast(intl)
        successToast(
          intl.formatMessage(
            { id: 'success-cancel-emailing-campaign' },
            { title: response.cancelEmailingCampaign?.emailingCampaign?.name },
          ),
        )
      })
      .catch(() => {
        setIsCanceling(false)
        hide()
        mutationErrorToast(intl)
      })
  }

  return (
    <Modal
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'title-modal-confirmation-cancel-sending' })}
      disclosure={
        <Button variant="secondary" variantColor="danger" variantSize="small">
          {intl.formatMessage({ id: 'cancel' })}
        </Button>
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
            <Heading>{intl.formatMessage({ id: 'title-modal-confirmation-cancel-sending' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>{intl.formatMessage({ id: 'global-action-irreversible' })}</Text>
          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button variantSize="medium" variant="secondary" variantColor="hierarchy" onClick={hide}>
                {intl.formatMessage({ id: 'global.back' })}
              </Button>
              <Button
                variantSize="medium"
                variant="primary"
                variantColor="danger"
                isLoading={isCanceling}
                onClick={() => onCancel(hide)}
              >
                {intl.formatMessage({ id: 'cancel-definitely' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default CancelSendingModal
