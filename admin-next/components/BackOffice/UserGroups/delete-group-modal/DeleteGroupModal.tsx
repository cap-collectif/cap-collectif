import * as React from 'react'
import {
  Button,
  ButtonQuickAction,
  CapUIIcon,
  CapUIModalSize,
  Flex,
  Heading,
  Modal,
  Text,
  toast,
} from '@cap-collectif/ui'
import { pxToRem } from '@shared/utils/pxToRem'
import { useIntl } from 'react-intl'
import DeleteGroupMutation from '@mutations/DeleteGroupMutation'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { useDisclosure } from '@liinkiing/react-hooks'
import { RefetchFnDynamic } from 'react-relay'
import { OperationType } from 'relay-runtime'
import { UserGroupsList_query$key } from '@relay/UserGroupsList_query.graphql'

type Props = {
  button: 'regular' | 'quick-action'
  groupId: string
  connectionId: string
  closeParentModal?: () => void
  refetch: RefetchFnDynamic<OperationType, UserGroupsList_query$key>
  term: string
}

export const DeleteGroupModal: React.FC<Props> = ({
  button = 'regular',
  groupId,
  closeParentModal,
  refetch,
  term,
  connectionId,
}) => {
  const intl = useIntl()
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const handleDeleteGroup = async (): Promise<void> => {
    setIsLoading(true)
    await DeleteGroupMutation.commit({
      input: { groupId },
      connectionId: [connectionId],
    })
      .then(() => {
        toast({
          variant: 'success',
          content: intl.formatMessage({ id: 'admin.group-deletion-success' }),
        })
        setIsLoading(false)
      })
      .catch(() => {
        mutationErrorToast(intl)
      })

    setIsLoading(false)
    refetch({ term })
    onClose()

    if (closeParentModal) {
      closeParentModal()
    }
  }

  return (
    <>
      {button === 'quick-action' ? (
        <ButtonQuickAction
          id="delete-btn"
          icon={CapUIIcon.Trash}
          label={intl.formatMessage({
            id: 'global.delete',
          })}
          variantColor={'danger'}
          onClick={onOpen}
        />
      ) : (
        <Button variant="tertiary" variantColor="danger" variantSize="big" leftIcon={CapUIIcon.TrashO} onClick={onOpen}>
          {intl.formatMessage({ id: 'global.delete' })}
        </Button>
      )}
      <Modal size={CapUIModalSize.Md} ariaLabel={'modal-title'} show={isOpen}>
        <Modal.Header height={pxToRem(72)}>
          <Heading>{intl.formatMessage({ id: 'group.admin.parameters.modal.delete.title' })}</Heading>
        </Modal.Header>

        <Modal.Body>
          <Flex direction={'column'} gap={4}>
            <Flex direction={'column'}>
              <Text>
                {intl.formatMessage({
                  id: 'group.admin.parameters.modal.delete.content',
                })}
              </Text>
            </Flex>
          </Flex>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" variantColor="primary" variantSize="big" onClick={onClose}>
            {intl.formatMessage({
              id: 'global.cancel',
            })}
          </Button>
          <Button
            variant="primary"
            variantColor="danger"
            variantSize="big"
            onClick={handleDeleteGroup}
            isLoading={isLoading}
          >
            {intl.formatMessage({
              id: 'global.permanently-remove',
            })}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default DeleteGroupModal
