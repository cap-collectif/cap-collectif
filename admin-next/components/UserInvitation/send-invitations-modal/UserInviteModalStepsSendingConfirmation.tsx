import * as React from 'react'
import { useIntl } from 'react-intl'
import {
  Box,
  Button,
  CapUIFontWeight,
  Flex,
  FormLabel,
  Heading,
  MultiStepModal,
  Text,
  toast,
  useMultiStepModal,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'
import InviteUserMutation, { INVITE_USERS_MAX_RESULTS } from '@mutations/InviteUserMutation'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { splitEmailsFromString } from '@shared/utils/emailsInput'
import { CsvEmails, UserInviteFormProps } from '../UserInvite.type'
import { InviteUsersRole } from '@relay/InviteUserMutation.graphql'

type Props = {
  id: string
  label: string
}

const UserInviteModalStepsSendingConfirmation = ({ id, label }: Props): JSX.Element => {
  const intl = useIntl()
  const { goToPreviousStep, hide } = useMultiStepModal()

  const methods = useFormContext()
  const {
    getValues,
    control,
    watch,
    setError,
    handleSubmit,
    formState: { isValid },
  } = methods

  const csvEmails = getValues('csvEmails')
  const inputEmails = getValues('inputEmails')
  const groups = getValues('groups')
  const groupsText =
    groups?.length > 0 ? groups.map(group => `"${group.label}"`).reduce((acc, text) => `${acc} / ${text}`) : ''

  const redirectionUrl = watch('redirectionUrl')

  const validateRedirectionUrl = () => {
    if (redirectionUrl !== '') {
      const hostname = new RegExp(window.location.hostname)

      if (!hostname.test(redirectionUrl)) {
        setError('redirectionUrl', {
          type: 'manual',
          message: intl.formatMessage({ id: 'input-redirection-url-match-error' }),
        })
        return
      }
    }
  }

  const emailsFromInput: string[] = splitEmailsFromString(inputEmails)
  const emailsFromCsv: CsvEmails[] = csvEmails?.importedUsers.map(user => user.email)

  const allEmails = [...emailsFromCsv, ...emailsFromInput]

  const onSubmit = (data: UserInviteFormProps) => {
    const role = data.role.labels[0]

    const input = {
      maxResults: INVITE_USERS_MAX_RESULTS,
      emails: allEmails as string[],
      role: role as InviteUsersRole,
      groups: data.groups.map(group => group.value),
      message: data.customMessage,
      redirectionUrl: data.redirectionUrl,
    }

    return (
      InviteUserMutation.commit({ input })
        .then(response => {
          // #region DELETE ME LATER -- see comment below
          // ! weird behaviour reproduced while waiting for a better way to handle emails already used
          // previous behaviour in prod was that if an email already linked to an account is added via inputEmail,
          // it doesn't stop the flow, but it's not making a toast pop (if single invite) or it's not taken into account in the success toast nbInvites value (if several invitations) (see below)
          // We need to create another issue to refactor the whole thing.
          // When it'll be done, we will want to **keep the toast** in this comment region and remove the rest
          // the count in the toast will need to be reverted to allEmails.length
          // more info: https://github.com/cap-collectif/platform/issues/17230#issuecomment-2491310319
          const actuallySentInvitations =
            response.inviteUsers.updatedInvitations.filter(invite => invite.node.status !== 'ACCEPTED').length +
            response.inviteUsers.newInvitations.length

          if (actuallySentInvitations > 0) {
            toast({
              variant: 'success',
              content: intl.formatMessage({ id: 'invite-sent' }, { nbInvites: actuallySentInvitations }),
            })
          }
        })
        // #endregion
        .catch(() => {
          mutationErrorToast(intl)
        })
    )
  }

  return (
    <>
      <MultiStepModal.Header id={id}>
        <MultiStepModal.Header.Label closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
          {intl.formatMessage({ id: 'user-invite-admin-page-title' })}
        </MultiStepModal.Header.Label>
        <Heading>{intl.formatMessage({ id: label })}</Heading>
      </MultiStepModal.Header>

      <MultiStepModal.Body>
        <Flex direction="column" spacing={4}>
          <Flex direction={'column'} spacing={1}>
            <Text fontWeight={CapUIFontWeight.Semibold} mr={2}>
              {intl.formatMessage({
                id: 'invitations-redirection.title',
              })}
            </Text>
            <Text lineHeight={'unset'}>
              {intl.formatMessage({
                id: 'invitations-redirection.description',
              })}
            </Text>
          </Flex>

          <FormControl control={control} name="redirectionUrl" key="redirectionUrl" isRequired={false}>
            <FormLabel
              aria-required={false}
              label={intl.formatMessage({
                id: 'invitations-redirection.label',
              })}
            />
            <FieldInput
              control={control}
              type="text"
              placeholder={intl.formatMessage({
                id: 'invitations-redirection.placeholder',
              })}
              name="redirectionUrl"
              id="redirectionUrl"
              onBlur={() => validateRedirectionUrl()}
            />
          </FormControl>

          <Text fontSize={16}>
            {intl.formatMessage(
              { id: 'user-invite.sending-confirmation.body' },
              {
                nbInvites: allEmails.length,
                // eslint-disable-next-line react/display-name
                b: (...chunks) => (
                  <Box as="span" fontWeight={CapUIFontWeight.Semibold}>
                    {chunks}
                  </Box>
                ),
              },
            )}
            {groups?.length === 0 && '.'}
            {groups?.length > 0 &&
              intl.formatMessage(
                { id: 'user-invite.sending-confirmation.body.groups' },
                {
                  nbInvites: allEmails.length,
                  groups: groupsText,
                  nbGroups: groups?.length,
                  // eslint-disable-next-line react/display-name
                  b: (...chunks) => (
                    <Box as="span" fontWeight={CapUIFontWeight.Semibold}>
                      {chunks}
                    </Box>
                  ),
                },
              )}
          </Text>
        </Flex>
      </MultiStepModal.Body>

      <MultiStepModal.Footer>
        <Button variant="secondary" variantColor="hierarchy" variantSize="big" onClick={() => goToPreviousStep()}>
          {intl.formatMessage({ id: 'global.back' })}
        </Button>
        <Button
          variant="primary"
          variantSize="big"
          disabled={!isValid}
          onClick={() => {
            handleSubmit(data => onSubmit(data as UserInviteFormProps))()
            hide()
          }}
        >
          {intl.formatMessage({ id: 'send-invitation' })}
        </Button>
      </MultiStepModal.Footer>
    </>
  )
}

export default UserInviteModalStepsSendingConfirmation
