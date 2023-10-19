import * as React from 'react'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import Button from '~ds/Button/Button'
import Modal from '~ds/Modal/Modal'
import Heading from '~ui/Primitives/Heading'
import Text from '~ui/Primitives/Text'
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction'
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup'
import type { ModalConfirmationDomainDelete_senderEmailDomain$key } from '~relay/ModalConfirmationDomainDelete_senderEmailDomain.graphql'
import DeleteSenderEmailDomainMutation from '~/mutations/DeleteSenderEmailDomainMutation'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import { toast } from '~ds/Toast'
type Props = {
  readonly senderEmailDomain: ModalConfirmationDomainDelete_senderEmailDomain$key
}
const FRAGMENT = graphql`
  fragment ModalConfirmationDomainDelete_senderEmailDomain on SenderEmailDomain {
    id
    value
  }
`

const deleteSenderEmailDomain = (senderEmailDomainId: string, hide: () => void, intl: IntlShape) => {
  const input = {
    id: senderEmailDomainId,
  }
  hide()
  return DeleteSenderEmailDomainMutation.commit({
    input,
  })
    .then(response => {
      if (response.deleteSenderEmailDomain?.errorCode) {
        mutationErrorToast(intl)
      } else {
        toast({
          variant: 'success',
          content: intl.formatMessage({
            id: 'domain-successfully-deleted',
          }),
        })
      }
    })
    .catch(() => {
      return mutationErrorToast(intl)
    })
}

const ModalConfirmationDomainDelete = ({ senderEmailDomain: senderEmailDomainFragment }: Props): JSX.Element => {
  const senderEmailDomain = useFragment(FRAGMENT, senderEmailDomainFragment)
  const intl = useIntl()
  return (
    <Modal
      ariaLabel={intl.formatMessage({
        id: 'delete-confirmation',
      })}
      disclosure={
        <ButtonQuickAction
          icon="TRASH"
          label={intl.formatMessage({
            id: 'global.delete',
          })}
          variantColor="danger"
        />
      }
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
              {intl.formatMessage(
                {
                  id: 'are-you-sure-to-delete-something',
                },
                {
                  element: senderEmailDomain.value,
                },
              )}
            </Text>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <ButtonGroup>
              <Button variantSize="medium" variant="secondary" variantColor="hierarchy" onClick={hide}>
                {intl.formatMessage({
                  id: 'cancel',
                })}
              </Button>
              <Button
                variantSize="medium"
                variant="primary"
                variantColor="danger"
                onClick={() => deleteSenderEmailDomain(senderEmailDomain.id, hide, intl)}
              >
                {intl.formatMessage({
                  id: 'global.delete',
                })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default ModalConfirmationDomainDelete
