import { FieldInput, FormControl } from '@cap-collectif/form'
import { Box, Button, CapUIIcon, CapUIIconSize, Flex, FormLabel, Icon, Tooltip } from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import { yupResolver } from '@hookform/resolvers/yup'
import UpdateUserAccountMutation from '@mutations/UpdateUserAccountMutation'
import UpdateUserAdminPersonalDataMutation from '@mutations/UpdateUserAdminPersonalDataMutation'
import type { GenderValue } from '@relay/UpdateUserAdminPersonalDataMutation.graphql'
import type {
  UserAdminPersonalData_user$data,
  UserAdminPersonalData_user$key,
} from '@relay/UserAdminPersonalData_user.graphql'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import moment, { Moment } from 'moment'
import * as React from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import * as yup from 'yup'
import { emptyToNull, formatDate, getOptionalTextSchema } from './utils'
import BackToUserListButton from './BackToUserListButton'

export type UserAdminPersonalDataFormValues = {
  email: string
  firstname: string
  lastname: string
  gender: string
  dateOfBirth: Moment | null
  address: string
  address2: string
  city: string
  zipCode: string
  phone: string
  userIdentificationCode: string
  newsletter: boolean
  isSubscribedToProposalNews: boolean
}

type Props = {
  user: UserAdminPersonalData_user$key
  methods: UseFormReturn<UserAdminPersonalDataFormValues>
}

const FRAGMENT = graphql`
  fragment UserAdminPersonalData_user on User {
    id
    isViewer
    isAdmin
    roles
    email
    emailConfirmationSentAt
    firstname
    lastname
    gender
    dateOfBirth
    address
    address2
    city
    zipCode
    phone
    phoneConfirmationSentAt
    userIdentificationCode
    isSubscribedToNewsLetter
    isSubscribedToProposalNews
    subscribedToNewsLetterAt
  }
`

const TEXT_FIELDS = ['email', 'firstname', 'lastname', 'address', 'address2', 'city', 'zipCode', 'phone'] as const

const getDefaultValues = (user: UserAdminPersonalData_user$data): UserAdminPersonalDataFormValues => ({
  email: user.email ?? '',
  firstname: user.firstname ?? '',
  lastname: user.lastname ?? '',
  gender: user.gender ?? '',
  dateOfBirth: user.dateOfBirth ? moment(user.dateOfBirth) : null,
  address: user.address ?? '',
  address2: user.address2 ?? '',
  city: user.city ?? '',
  zipCode: user.zipCode ?? '',
  phone: user.phone ?? '',
  userIdentificationCode: user.userIdentificationCode ?? '',
  newsletter: user.isSubscribedToNewsLetter,
  isSubscribedToProposalNews: user.isSubscribedToProposalNews,
})

// The form is created by the page, so that its unsaved values survive a tab change
export const useUserAdminPersonalDataForm = (userRef: UserAdminPersonalData_user$key) => {
  const intl = useIntl()
  const user = useFragment(FRAGMENT, userRef)

  const schema = yup.object().shape(Object.fromEntries(TEXT_FIELDS.map(field => [field, getOptionalTextSchema(intl)])))

  return useForm<UserAdminPersonalDataFormValues>({
    defaultValues: getDefaultValues(user),
    resolver: yupResolver(schema),
  })
}

const ConfirmationIcon: React.FC<{ label: string }> = ({ label }) => (
  <Tooltip label={label}>
    <Flex as="span" ml={1}>
      <Icon name={CapUIIcon.CheckO} size={CapUIIconSize.Md} color="green.500" aria-label={label} />
    </Flex>
  </Tooltip>
)

const UserAdminPersonalData: React.FC<Props> = ({ user: userRef, methods }) => {
  const intl = useIntl()
  const formId = React.useId()
  const user = useFragment(FRAGMENT, userRef)
  const { viewerSession } = useAppContext()
  const { control, formState, handleSubmit, reset } = methods

  // Same rule as the legacy form: the user themself or a super admin
  const isDisabled = !user.isViewer && !viewerSession.isSuperAdmin
  // Fields are locked while saving, so that the reset after the response does not erase a newer input
  const areFieldsDisabled = isDisabled || formState.isSubmitting

  const genderOptions = [
    { value: 'MALE', label: intl.formatMessage({ id: 'gender.male' }) },
    { value: 'FEMALE', label: intl.formatMessage({ id: 'global.female' }) },
    { value: 'OTHER', label: intl.formatMessage({ id: 'global.plural.other' }) },
  ]

  const onSubmit = async (values: UserAdminPersonalDataFormValues) => {
    try {
      const response = await UpdateUserAdminPersonalDataMutation.commit({
        input: {
          userId: user.id,
          email: emptyToNull(values.email),
          firstname: emptyToNull(values.firstname),
          lastname: emptyToNull(values.lastname),
          gender: (emptyToNull(values.gender) as GenderValue | null) ?? null,
          dateOfBirth: values.dateOfBirth?.isValid() ? values.dateOfBirth.format('YYYY-MM-DD HH:mm:ss') : null,
          address: emptyToNull(values.address),
          address2: emptyToNull(values.address2),
          city: emptyToNull(values.city),
          zipCode: emptyToNull(values.zipCode),
          phone: emptyToNull(values.phone),
          // Only a super admin can change it, sending it otherwise would not change anything
          ...(viewerSession.isSuperAdmin ? { userIdentificationCode: emptyToNull(values.userIdentificationCode) } : {}),
        },
      })
      if (!response.updateProfilePersonalData?.user || response.updateProfilePersonalData.errorCode) {
        mutationErrorToast(intl)
        return
      }
      // This subscription is not part of the personal data input, it is saved with the account mutation
      if (user.isAdmin && values.isSubscribedToProposalNews !== user.isSubscribedToProposalNews) {
        const accountResponse = await UpdateUserAccountMutation.commit({
          input: {
            userId: user.id,
            // The mutation requires the roles, the current ones are sent so that they stay unchanged
            roles: [...user.roles],
            subscribedToProposalNews: values.isSubscribedToProposalNews,
          },
        })
        if (!accountResponse.updateUserAccount?.user) {
          mutationErrorToast(intl)
          return
        }
      }
      reset(values)
      successToast(intl.formatMessage({ id: 'admin.update.successful' }))
    } catch {
      mutationErrorToast(intl)
    }
  }

  const renderTextField = (
    name: typeof TEXT_FIELDS[number] | 'userIdentificationCode',
    id: string,
    label: string,
    {
      isFieldDisabled = areFieldsDisabled,
      placeholder,
      labelAddon,
    }: { isFieldDisabled?: boolean; placeholder?: string; labelAddon?: React.ReactNode } = {},
  ) => (
    <FormControl name={name} control={control} isDisabled={isFieldDisabled} width="100%" maxWidth="400px">
      <FormLabel htmlFor={id} label={label}>
        {labelAddon}
      </FormLabel>
      <FieldInput type="text" name={name} id={id} control={control} placeholder={placeholder} />
    </FormControl>
  )

  return (
    <Box bg="white" p={6} borderRadius="0 0 8px 8px" width="100%">
      <Flex as="form" id={formId} direction="column" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Flex gap={6}>
          {renderTextField(
            'firstname',
            'personal-data-form-firstname',
            intl.formatMessage({ id: 'form.label_firstname' }),
          )}
          {renderTextField('lastname', 'personal-data-form-lastname', intl.formatMessage({ id: 'global.name' }))}
        </Flex>
        <Flex gap={6}>
          <FormControl
            name="dateOfBirth"
            control={control}
            isDisabled={areFieldsDisabled}
            width="100%"
            maxWidth="400px"
          >
            <FormLabel htmlFor="dateOfBirth" label={intl.formatMessage({ id: 'form.label_date_of_birth' })} />
            <FieldInput
              type="date"
              name="dateOfBirth"
              id="dateOfBirth"
              control={control}
              max={moment().format('YYYY-MM-DD')}
              placeholder={intl.formatMessage({ id: 'date.placeholder' })}
            />
          </FormControl>
          <FormControl name="gender" control={control} isDisabled={areFieldsDisabled} width="100%" maxWidth="400px">
            <FormLabel htmlFor="personal-data-form-gender" label={intl.formatMessage({ id: 'form.label_gender' })} />
            <FieldInput
              type="select"
              name="gender"
              id="personal-data-form-gender"
              control={control}
              options={genderOptions}
              placeholder={intl.formatMessage({ id: 'global.select' })}
              clearable
            />
          </FormControl>
        </Flex>
        <Flex gap={6}>
          {renderTextField('email', 'personal-data-email', intl.formatMessage({ id: 'share.mail' }), {
            labelAddon: user.emailConfirmationSentAt ? (
              <ConfirmationIcon
                label={`${intl.formatMessage({ id: 'confirmed-by-email' })} ${formatDate(
                  intl,
                  user.emailConfirmationSentAt,
                )}`}
              />
            ) : null,
          })}
          {renderTextField('phone', 'phone', intl.formatMessage({ id: 'form.label_phone' }), {
            placeholder: intl.formatMessage({ id: 'profil-field-phone-placeholder' }),
            labelAddon: user.phoneConfirmationSentAt ? (
              <ConfirmationIcon
                label={`${intl.formatMessage({ id: 'number-verified' })} ${formatDate(
                  intl,
                  user.phoneConfirmationSentAt,
                )}`}
              />
            ) : null,
          })}
        </Flex>
        <Flex gap={6}>
          {renderTextField('address', 'personal-data-form-address', intl.formatMessage({ id: 'form.label_address' }))}
          {renderTextField(
            'address2',
            'personal-data-form-address2',
            intl.formatMessage({ id: 'form.label_address2' }),
          )}
        </Flex>
        <Flex gap={6}>
          {renderTextField('city', 'city', intl.formatMessage({ id: 'form.label_city' }))}
          {renderTextField('zipCode', 'zipCode', intl.formatMessage({ id: 'form.label_zip_code' }))}
        </Flex>
        {renderTextField(
          'userIdentificationCode',
          'userIdentificationCode',
          intl.formatMessage({ id: 'identification_code' }),
          { isFieldDisabled: !viewerSession.isSuperAdmin || formState.isSubmitting },
        )}

        <FormLabel label={intl.formatMessage({ id: 'subscription' })} mt={4} mb={2} />
        {/* Only the user can change their own subscriptions */}
        <FormControl name="newsletter" control={control} isDisabled mb={0}>
          <FieldInput type="checkbox" name="newsletter" id="newsletter" control={control}>
            {user.subscribedToNewsLetterAt
              ? `${intl.formatMessage({ id: 'newsletter' })} (${formatDate(intl, user.subscribedToNewsLetterAt)})`
              : intl.formatMessage({ id: 'newsletter' })}
          </FieldInput>
        </FormControl>
        {user.isAdmin ? (
          <FormControl
            name="isSubscribedToProposalNews"
            control={control}
            isDisabled={!user.isViewer || formState.isSubmitting}
          >
            <FieldInput
              type="checkbox"
              name="isSubscribedToProposalNews"
              id="isSubscribedToProposalNews"
              control={control}
            >
              {intl.formatMessage({ id: 'proposals-actualities' })}
            </FieldInput>
          </FormControl>
        ) : null}

        <Flex mt={6} gap={4}>
          <Button
            id="user-admin-personal-data-save"
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

export default UserAdminPersonalData
