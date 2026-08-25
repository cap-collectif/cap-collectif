import { Button, CapUIModalSize, Heading, Modal, Text } from '@cap-collectif/ui'
import { useDeleteSocialNetworkMutation } from '@mutations/DeleteSocialNetworkMutation'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { SocialNetworkRow } from './types'

type Props = {
  show: boolean
  onClose: () => void
  connectionId?: string | null
  socialNetwork: SocialNetworkRow | null
}

const SocialNetworkDeleteModal: React.FC<Props> = ({ show, onClose, connectionId, socialNetwork }) => {
  const intl = useIntl()
  const { commit, isLoading } = useDeleteSocialNetworkMutation()

  if (!socialNetwork) return null

  const onDelete = () => {
    commit({
      variables: {
        input: { id: socialNetwork.id },
        connections: connectionId ? [connectionId] : [],
      },
      onCompleted: () => {
        successToast(intl.formatMessage({ id: 'global.deleted' }))
        onClose()
      },
      onError: () => {
        mutationErrorToast(intl)
      },
    })
  }

  return (
    <Modal
      show={show}
      onClose={onClose}
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'are-you-sure-to-delete-something' }, { element: socialNetwork.title })}
    >
      <Modal.Header>
        <Heading>
          {intl.formatMessage({ id: 'are-you-sure-to-delete-something' }, { element: socialNetwork.title })}
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <Text>{intl.formatMessage({ id: 'global-action-irreversible' })}</Text>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={onClose} variant="secondary" variantSize="big" variantColor="hierarchy">
          {intl.formatMessage({ id: 'global.cancel' })}
        </Button>
        <Button type="button" variantColor="danger" variantSize="big" onClick={onDelete} isLoading={isLoading}>
          {intl.formatMessage({ id: 'global.delete' })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SocialNetworkDeleteModal
