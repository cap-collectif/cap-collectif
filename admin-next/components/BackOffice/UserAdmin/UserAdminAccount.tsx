import { FieldInput, FormControl } from '@cap-collectif/form'
import { Box, Button, Flex, FormLabel } from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import { yupResolver } from '@hookform/resolvers/yup'
import UpdateUserAccountMutation from '@mutations/UpdateUserAccountMutation'
import type { UserRole } from '@relay/UpdateUserAccountMutation.graphql'
import type { UserAdminAccount_user$data, UserAdminAccount_user$key } from '@relay/UserAdminAccount_user.graphql'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import * as React from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import * as yup from 'yup'
import BackToUserListButton from './BackToUserListButton'
import DeleteUserAccountModal from './DeleteUserAccountModal'

export type UserAdminAccountFormValues = {
  vip: boolean
  enabled: boolean
  locked: boolean
  roles: { labels: UserRole[] }
}

type Props = {
  user: UserAdminAccount_user$key
  methods: UseFormReturn<UserAdminAccountFormValues>
}

const FRAGMENT = graphql`
  fragment UserAdminAccount_user on User {
    id
    roles
    locked
    vip
    enabled
    isSuperAdmin
    ...DeleteUserAccountModal_user
  }
`

const getDefaultValues = (user: UserAdminAccount_user$data): UserAdminAccountFormValues => ({
  vip: user.vip,
  enabled: user.enabled,
  locked: user.locked,
  roles: { labels: [...user.roles] },
})

// The form is created by the page, so that its unsaved values survive a tab change
export const useUserAdminAccountForm = (userRef: UserAdminAccount_user$key) => {
  const intl = useIntl()
  const user = useFragment(FRAGMENT, userRef)

  const schema = yup.object().shape({
    roles: yup.object().shape({
      labels: yup.array().min(1, intl.formatMessage({ id: '1-option-minimum' })),
    }),
  })

  return useForm<UserAdminAccountFormValues>({
    defaultValues: getDefaultValues(user),
    resolver: yupResolver(schema),
  })
}

const UserAdminAccount: React.FC<Props> = ({ user: userRef, methods }) => {
  const intl = useIntl()
  const formId = React.useId()
  const user = useFragment(FRAGMENT, userRef)
  const { viewerSession } = useAppContext()
  const hasProjectAdminFeature = useFeatureFlag('project_admin')
  const { control, formState, handleSubmit, reset } = methods

  const roleChoices = [
    { id: 'ROLE_USER', useIdAsValue: true, label: intl.formatMessage({ id: 'roles.user' }) },
    {
      id: 'ROLE_SHIELD_AUTHORIZED_USER',
      useIdAsValue: true,
      label: intl.formatMessage({ id: 'roles.shield_authorized_user' }),
      description: intl.formatMessage({ id: 'roles.shield_authorized_user_help' }),
    },
    { id: 'ROLE_ADMIN', useIdAsValue: true, label: intl.formatMessage({ id: 'roles.admin' }) },
    ...(hasProjectAdminFeature
      ? [{ id: 'ROLE_PROJECT_ADMIN', useIdAsValue: true, label: intl.formatMessage({ id: 'roles.project_admin' }) }]
      : []),
    ...(viewerSession.isSuperAdmin
      ? [{ id: 'ROLE_SUPER_ADMIN', useIdAsValue: true, label: intl.formatMessage({ id: 'roles.super_admin' }) }]
      : []),
  ]

  // Only a super admin can delete a super admin account
  const canDelete = !user.isSuperAdmin || viewerSession.isSuperAdmin

  // Fields are locked while saving, so that the reset after the response does not erase a newer input
  const areFieldsDisabled = formState.isSubmitting

  const onSubmit = async (values: UserAdminAccountFormValues) => {
    try {
      const response = await UpdateUserAccountMutation.commit({
        input: {
          userId: user.id,
          vip: values.vip,
          enabled: values.enabled,
          locked: values.locked,
          roles: values.roles.labels,
        },
      })
      if (!response.updateUserAccount?.user) {
        mutationErrorToast(intl)
        return
      }
      reset(values)
      successToast(intl.formatMessage({ id: 'admin.update.successful' }))
    } catch {
      mutationErrorToast(intl)
    }
  }

  return (
    <Box bg="white" p={6} borderRadius="0 0 8px 8px" width="100%">
      <Flex as="form" id={formId} direction="column" onSubmit={handleSubmit(onSubmit)}>
        <FormLabel label={intl.formatMessage({ id: 'admin.fields.step.group_statuses' })} mb={2} />
        <Flex direction="column" spacing={1}>
          <FormControl name="vip" control={control} isDisabled={areFieldsDisabled} mb={0}>
            <FieldInput type="checkbox" name="vip" id="vip" control={control}>
              {intl.formatMessage({ id: 'form.label_vip' })}
            </FieldInput>
          </FormControl>
          <FormControl name="enabled" control={control} isDisabled={areFieldsDisabled} mb={0}>
            <FieldInput type="checkbox" name="enabled" id="enabled" control={control}>
              {intl.formatMessage({ id: 'form.label_enabled' })}
            </FieldInput>
          </FormControl>
          <FormControl name="locked" control={control} isDisabled={areFieldsDisabled} mb={0}>
            <FieldInput type="checkbox" name="locked" id="locked" control={control}>
              {intl.formatMessage({ id: 'form.label_locked' })}
            </FieldInput>
          </FormControl>
        </Flex>

        <FormControl name="roles" control={control} isDisabled={areFieldsDisabled} mt={4}>
          <FormLabel label={intl.formatMessage({ id: 'form.label_real_roles' })} />
          <FieldInput type="checkbox" name="roles" id="user_roles" control={control} choices={roleChoices} />
        </FormControl>

        <Flex mt={6} gap={4}>
          <Button
            id="user_admin_account_save"
            type="submit"
            form={formId}
            variant="primary"
            variantColor="primary"
            variantSize="small"
            isLoading={formState.isSubmitting}
            disabled={!formState.isDirty}
          >
            {intl.formatMessage({ id: 'global.save' })}
          </Button>
          {canDelete ? <DeleteUserAccountModal user={user} /> : null}
          <BackToUserListButton />
        </Flex>
      </Flex>
    </Box>
  )
}

export default UserAdminAccount
