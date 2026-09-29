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
} from '@cap-collectif/ui'
import DeleteNewsletterSubscriptionMutation from '@mutations/DeleteNewsletterSubscriptionMutation'
import { NewsletterSubscriptionList_query$key } from '@relay/NewsletterSubscriptionList_query.graphql'
import { dangerToast, mutationErrorToast } from '@shared/utils/toasts'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { RefetchFnDynamic } from 'react-relay'
import { OperationType } from 'relay-runtime'

type Props = {
  newsletterSubscription: {
    readonly id: string
    readonly email: string
  }
  connectionId: string
  refetch: RefetchFnDynamic<OperationType, NewsletterSubscriptionList_query$key>
  search: string | null
}

const DeleteNewsletterSubscriptionModal: React.FC<Props> = ({
  newsletterSubscription,
  connectionId,
  refetch,
  search,
}) => {
  const intl = useIntl()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const { email } = newsletterSubscription

  const onDelete = async (hide: () => void) => {
    setIsDeleting(true)
    try {
      const response = await DeleteNewsletterSubscriptionMutation.commit({
        input: { id: newsletterSubscription.id },
        connections: [connectionId],
      })
      if (response.deleteNewsletterSubscription?.errorCode) {
        mutationErrorToast(intl)
        return
      }
      dangerToast(intl.formatMessage({ id: 'success.delete.flash' }, { name: email }))
      refetch({ search })
      hide()
    } catch {
      mutationErrorToast(intl)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
      disclosure={
        <ButtonQuickAction
          icon={CapUIIcon.Trash}
          size={CapUIIconSize.Md}
          variantColor="danger"
          label={intl.formatMessage({ id: 'admin.newsletter-subscriptions.delete' }, { email: email })}
        />
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'delete-confirmation' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>{intl.formatMessage({ id: 'are-you-sure-to-delete-something' }, { element: email })}</Text>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <ButtonGroup>
              <Button variantSize="medium" variant="secondary" variantColor="hierarchy" onClick={hide}>
                {intl.formatMessage({ id: 'global.cancel' })}
              </Button>
              <Button
                variantSize="medium"
                variant="primary"
                variantColor="danger"
                data-cy="deletion-confirmation"
                isLoading={isDeleting}
                onClick={() => onDelete(hide)}
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

export default DeleteNewsletterSubscriptionModal
