import * as React from 'react'
import { IntlShape, useIntl } from 'react-intl'
import RelaunchUserInvitationsMutation from '@mutations/RelaunchUserInvitationsMutation'
import { Button, CapUIIcon, Flex, toast, Text, Modal, Heading, CapUIModalSize, Radio } from '@cap-collectif/ui'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { UserInvite } from '../UserInvite.type'

type Props = {
  readonly invitations: Array<UserInvite>
}

type RelaunchConfirmationMessageProps = {
  readonly invitations: {
    readonly relaunchable: Array<UserInvite>
    readonly relaunched: Array<UserInvite>
    readonly notRelaunched: Array<UserInvite>
  }
}

export const UserInviteRelaunchInvitations = ({ invitations }: Props): JSX.Element => {
  const intl = useIntl()
  const [exclude, setExclude] = React.useState(false)

  const relaunchable = invitations.filter(invitation => invitation.status === 'EXPIRED')
  const relaunched = relaunchable.filter(invitation => invitation.relaunchCount > 0)
  const notRelaunched = relaunchable.filter(invitation => invitation.relaunchCount < 1)
  const relaunchChoice = exclude ? notRelaunched : relaunchable

  const onSubmit = async (invitations: UserInvite[], intl: IntlShape): Promise<void> => {
    const emails = invitations.map(invitation => invitation.email)
    const input = { emails }
    await RelaunchUserInvitationsMutation.commit({ input })
      .then(() => {
        toast({
          variant: 'success',
          content: intl.formatMessage({ id: 'invite-sent' }, { nbInvites: emails.length }),
        })
      })
      .catch(() => {
        mutationErrorToast(intl)
      })

    setExclude(false)
    return
  }

  return (
    <Modal
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({
        id: 'invitations.relaunch.confirm',
      })}
      disclosure={
        <Button
          variantSize="small"
          disabled={relaunchable.length === 0}
          variant="secondary"
          leftIcon={CapUIIcon.Envelope}
        >
          {intl.formatMessage({
            id: 'invitations.relaunch',
          })}
        </Button>
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>
              {intl.formatMessage({
                id: 'invitations.relaunch.confirm',
              })}
            </Heading>
          </Modal.Header>
          <Modal.Body>
            <RelaunchConfirmationMessage invitations={{ relaunchable, relaunched, notRelaunched }} />

            {relaunchable.length > 1 && relaunched.length > 0 && (
              <Flex direction="column" mt={4} ml={4}>
                <Radio
                  name="include-relaunched"
                  id="include-relaunched"
                  checked={!exclude}
                  onClick={() => setExclude(false)}
                >
                  {intl.formatMessage(
                    { id: 'invitations.relaunch.include' },
                    { relaunchedInvitations: relaunched.length },
                  )}
                </Radio>
                <Radio
                  name="exclude-relaunched"
                  id="exclude-relaunched"
                  checked={exclude}
                  onClick={() => setExclude(true)}
                >
                  {intl.formatMessage(
                    { id: 'invitations.relaunch.exclude' },
                    { relaunchedInvitations: relaunched.length },
                  )}
                </Radio>
              </Flex>
            )}
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
              onClick={async () => {
                onSubmit(relaunchChoice, intl)
                hide()
              }}
            >
              {intl.formatMessage({
                id: 'global.confirm',
              })}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default UserInviteRelaunchInvitations

const RelaunchConfirmationMessage: React.FC<RelaunchConfirmationMessageProps> = ({ invitations }): JSX.Element => {
  const intl = useIntl()
  const { relaunchable, relaunched, notRelaunched } = invitations

  // some of the selected users have already had reminders sent to them, some have not
  if (relaunchable.length > 1 && relaunched.length > 0 && relaunchable.length > relaunched.length) {
    return (
      <Text>
        {intl.formatMessage(
          { id: 'invitations.relaunch-expired' },
          { count: relaunchable.length, relaunched: relaunched.length },
        )}
      </Text>
    )
  }

  // all the selected users have already had reminders sent to them
  if (relaunchable.length === relaunched.length) {
    return (
      <Text>{intl.formatMessage({ id: 'invitations.relaunch.already-relaunched' }, { count: relaunched.length })}</Text>
    )
  }

  // none of the selected users have had reminders sent to them
  return (
    <Text>{intl.formatMessage({ id: 'invitations.relaunched.none-relaunched' }, { count: notRelaunched.length })}</Text>
  )
}
