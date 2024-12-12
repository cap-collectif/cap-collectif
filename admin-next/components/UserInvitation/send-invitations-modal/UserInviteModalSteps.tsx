import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import UserInviteModalStepsSendingConfirmation from './UserInviteModalStepsSendingConfirmation'
import { Button, CapUIIcon, CapUIModalSize, MultiStepModal } from '@cap-collectif/ui'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import UserInviteModalStepsChooseUsers from './UserInviteModalStepsChooseUsers'
import UserInviteModalStepsChooseRole from './UserInviteModalStepsChooseRole'
import { UserInviteFormProps } from '@components/UserInvitation/UserInvite.type'

const FRAGMENT = graphql`
  fragment UserInviteModalSteps_query on Query {
    ...UserInviteModalStepsChooseRole_query
  }
`

export const UserInviteModalSteps = ({ query: queryFragment }): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isOpen, setIsOpen] = React.useState(false)
  const query = useFragment(FRAGMENT, queryFragment)
  const intl = useIntl()

  const methods = useForm<UserInviteFormProps>({
    mode: 'onSubmit',
    defaultValues: {
      role: { labels: ['ROLE_USER' as string] },
      groups: [],
      inputEmails: '',
      csvEmails: {
        duplicateLines: [],
        importedUsers: [],
        invalidLines: [],
      },
      customMessage: '',
      redirectionUrl: '',
      file: null,
    },
  })

  const { reset } = methods

  return (
    <FormProvider {...methods}>
      <MultiStepModal
        size={CapUIModalSize.Xl}
        show={isOpen}
        onClose={() => reset()}
        ariaLabel={intl.formatMessage({ id: 'invite-users-button-body' })}
        disclosure={
          <Button variant="primary" leftIcon={CapUIIcon.Add} variantSize="small">
            {intl.formatMessage({
              id: 'organization.invite',
            })}
          </Button>
        }
        hideOnClickOutside={false}
      >
        <UserInviteModalStepsChooseUsers
          id="choose-users"
          label={'select-users-to-invite'}
          validationLabel={intl.formatMessage({
            id: 'setup-invitation',
          })}
        />

        <UserInviteModalStepsChooseRole query={query} id="choose-role" label={'user-invite-settings'} />

        <UserInviteModalStepsSendingConfirmation
          id="send-confirmation"
          label="organization.invite.verify-before-sending"
        />
      </MultiStepModal>
    </FormProvider>
  )
}

export default UserInviteModalSteps
