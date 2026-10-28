import { FieldInput, FormControl } from '@cap-collectif/form'
import { Box, Button, Flex, FormLabel } from '@cap-collectif/ui'
import { yupResolver } from '@hookform/resolvers/yup'
import UpdateProfilePasswordMutation from '@mutations/UpdateProfilePasswordMutation'
import type { UserAdminPassword_user$key } from '@relay/UserAdminPassword_user.graphql'
import { getPasswordError } from '@shared/form/Password'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import '@shared/utils/yupExtensions'
import * as React from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import * as yup from 'yup'
import BackToUserListButton from './BackToUserListButton'

export type UserAdminPasswordFormValues = {
  current_password: string
  new_password: string
}

type Props = {
  user: UserAdminPassword_user$key
  methods: UseFormReturn<UserAdminPasswordFormValues>
}

const FRAGMENT = graphql`
  fragment UserAdminPassword_user on User {
    isViewer
  }
`

const DEFAULT_VALUES: UserAdminPasswordFormValues = { current_password: '', new_password: '' }

// The form is created by the page, so that its unsaved values survive a tab change
export const useUserAdminPasswordForm = () => {
  const intl = useIntl()
  const requiredMessage = intl.formatMessage({ id: 'global.required' })

  const schema = yup.object().shape({
    current_password: yup.string().notBlank(requiredMessage),
    // Same complexity rules as the legacy form (8 characters, upper and lower case letters, a digit)
    new_password: yup
      .string()
      .notBlank(requiredMessage)
      .test('password-complexity', (value, { createError }) => {
        const password = value ?? ''
        const error = getPasswordError(
          password.length >= 8,
          /[A-Z]/.test(password) && /[a-z]/.test(password),
          /\d/.test(password),
        )

        return error ? createError({ message: intl.formatMessage({ id: error }) }) : true
      }),
  })

  return useForm<UserAdminPasswordFormValues>({
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  })
}

const UserAdminPassword: React.FC<Props> = ({ user: userRef, methods }) => {
  const intl = useIntl()
  const formId = React.useId()
  const user = useFragment(FRAGMENT, userRef)
  const { control, formState, handleSubmit, reset, setError } = methods

  // The mutation only changes the viewer's password
  const isDisabled = !user.isViewer

  const onSubmit = async (values: UserAdminPasswordFormValues) => {
    try {
      const response = await UpdateProfilePasswordMutation.commit({
        input: { current_password: values.current_password, new_password: values.new_password },
      })
      const error = response.updateProfilePassword?.error
      if (error) {
        setError('current_password', { message: intl.formatMessage({ id: error }) })
        return
      }
      if (!response.updateProfilePassword?.user) {
        mutationErrorToast(intl)
        return
      }
      reset(DEFAULT_VALUES)
      successToast(intl.formatMessage({ id: 'admin.update.successful' }))
    } catch {
      mutationErrorToast(intl)
    }
  }

  return (
    <Box bg="white" p={6} borderRadius="0 0 8px 8px" width="100%">
      <Flex as="form" id={formId} direction="column" onSubmit={handleSubmit(onSubmit)}>
        <FormControl name="current_password" control={control} isDisabled={isDisabled} isRequired maxWidth="400px">
          <FormLabel htmlFor="password-form-current" label={intl.formatMessage({ id: 'form.current_password' })} />
          <FieldInput
            type="password"
            name="current_password"
            id="password-form-current"
            control={control}
            autoComplete="current-password"
          />
        </FormControl>
        <FormControl name="new_password" control={control} isDisabled={isDisabled} isRequired maxWidth="400px">
          <FormLabel htmlFor="password-form-new_password" label={intl.formatMessage({ id: 'new-password' })} />
          <FieldInput
            type="password"
            name="new_password"
            id="password-form-new_password"
            control={control}
            autoComplete="new-password"
          />
        </FormControl>

        <Flex mt={6} gap={4}>
          <Button
            id="user-admin-password-save"
            type="submit"
            form={formId}
            variant="primary"
            variantColor="primary"
            variantSize="small"
            isLoading={formState.isSubmitting}
            disabled={isDisabled || !formState.isDirty}
          >
            {intl.formatMessage({ id: 'global.save' })}
          </Button>
          <BackToUserListButton />
        </Flex>
      </Flex>
    </Box>
  )
}

export default UserAdminPassword
