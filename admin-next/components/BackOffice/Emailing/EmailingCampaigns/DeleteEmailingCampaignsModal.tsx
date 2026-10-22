import * as React from 'react'
import { FormattedHTMLMessage, useIntl } from 'react-intl'
import { Button, ButtonGroup, CapUIModalSize, Heading, Modal, Text } from '@cap-collectif/ui'
import DeleteEmailingCampaignsMutation from '@mutations/DeleteEmailingCampaignsMutation'
import { dangerToast, mutationErrorToast } from '@shared/utils/toasts'

type Props = {
  readonly campaignIds: string[]
  readonly onClose: () => void
  readonly onDeleted: () => void
}

const DeleteEmailingCampaignsModal: React.FC<Props> = ({ campaignIds, onClose, onDeleted }) => {
  const intl = useIntl()
  const [isDeleting, setIsDeleting] = React.useState(false)
  const count = campaignIds.length

  const onDelete = () => {
    setIsDeleting(true)

    return DeleteEmailingCampaignsMutation.commit({ input: { ids: campaignIds } })
      .then(response => {
        setIsDeleting(false)
        onClose()
        if (response.deleteEmailingCampaigns?.error) return mutationErrorToast(intl)
        // Sent campaigns are archived instead of deleted, but disappear from the list all the same
        const removedCount =
          (response.deleteEmailingCampaigns?.deletedIds?.length ?? 0) +
          (response.deleteEmailingCampaigns?.archivedIds?.length ?? 0)
        dangerToast(intl.formatMessage({ id: 'success-delete-emailing-campaign' }, { num: removedCount }))
        onDeleted()
      })
      .catch(() => {
        setIsDeleting(false)
        onClose()
        mutationErrorToast(intl)
      })
  }

  return (
    <Modal
      show
      onClose={onClose}
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'title-delete-campaign-confirmation' }, { num: count })}
    >
      <Modal.Header closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
        <Heading>{intl.formatMessage({ id: 'title-delete-campaign-confirmation' }, { num: count })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <Text>
          <FormattedHTMLMessage id="delete-campaign-confirmation" values={{ num: count }} />
        </Text>
      </Modal.Body>
      <Modal.Footer>
        <ButtonGroup>
          <Button variantSize="medium" variant="secondary" variantColor="hierarchy" onClick={onClose}>
            {intl.formatMessage({ id: 'cancel' })}
          </Button>
          <Button
            variantSize="medium"
            variant="primary"
            variantColor="danger"
            isLoading={isDeleting}
            onClick={onDelete}
            data-cy="delete-emailing-campaigns-confirmation"
          >
            {intl.formatMessage({ id: 'global.removeDefinitively' })}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </Modal>
  )
}

export default DeleteEmailingCampaignsModal
