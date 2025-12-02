import { Button, CapUIIcon, CapUIModalSize, Flex, Heading, Modal } from '@cap-collectif/ui'
import CancelUserInvitationsMutation from '@mutations/CancelUserInvitationsMutation'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { FormattedHTMLMessage, useIntl } from 'react-intl'

type Props = {
  readonly invitations: Array<string>
}

export const UserInviteCancelInvitations = ({ invitations }: Props): JSX.Element => {
  const intl = useIntl()

  const cancelInvite = async invitationsEmails => {
    try {
      await CancelUserInvitationsMutation.commit({
        input: {
          invitationsEmails,
        },
      })
      successToast(intl.formatMessage({ id: 'invite-deleted' }, { nbInvites: invitationsEmails.length }))
    } catch {
      mutationErrorToast(intl)
    }
  }

  return (
    <Modal
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({
        id: 'invitations.delete.message',
      })}
      disclosure={
        <Button
          mr={6}
          variantSize="small"
          disabled={invitations.length === 0}
          variant="tertiary"
          variantColor="danger"
          leftIcon={CapUIIcon.TrashO}
        >
          {intl.formatMessage({
            id: 'global.remove',
          })}
        </Button>
      }
      hideOnClickOutside={false}
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>
              {intl.formatMessage({
                id: 'global.confirm.removal',
              })}
            </Heading>
          </Modal.Header>
          <Modal.Body>
            <Flex direction="row" mt={2}>
              <Flex direction={'column'}>
                <FormattedHTMLMessage
                  tagName="span"
                  id="invitations.delete.message"
                  values={{
                    invitationsCount: invitations.length,
                  }}
                />
                <FormattedHTMLMessage tagName="span" id="warning-action-irreversible" />
              </Flex>
            </Flex>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <Button color="gray.400" variant="secondary" variantColor="hierarchy" variantSize="big" onClick={hide}>
              {intl.formatMessage({
                id: 'global.cancel',
              })}
            </Button>
            <Button
              variant="primary"
              variantSize="big"
              variantColor="danger"
              onClick={() => {
                cancelInvite(invitations)
                hide()
              }}
            >
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
export default UserInviteCancelInvitations
