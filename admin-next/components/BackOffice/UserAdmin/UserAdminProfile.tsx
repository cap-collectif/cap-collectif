import { FieldInput, FormControl, UploaderValue } from '@cap-collectif/form'
import { Accordion, Box, Button, CapUIAccordionSize, Flex, FormLabel, UPLOADER_SIZE } from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import { yupResolver } from '@hookform/resolvers/yup'
import UpdateProfilePublicDataMutation from '@mutations/UpdateProfilePublicDataMutation'
import type { UserAdminProfile_query$key } from '@relay/UserAdminProfile_query.graphql'
import type { UserAdminProfile_user$data, UserAdminProfile_user$key } from '@relay/UserAdminProfile_user.graphql'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { isUrl } from '@shared/utils/validators'
import '@shared/utils/yupExtensions'
import { UPLOAD_PATH } from '@utils/config'
import * as React from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import * as yup from 'yup'
import BackToUserListButton from './BackToUserListButton'
import {
  AVATAR_FORMAT,
  AVATAR_MAX_SIZE,
  emptyToNull,
  FACEBOOK_REGEX,
  FIELD_MAX_LENGTH,
  FIELD_MIN_LENGTH,
  getOptionalTextSchema,
  INSTAGRAM_REGEX,
  LINKEDIN_REGEX,
  REGEX_USERNAME,
  TWITTER_REGEX,
} from './utils'

export type UserAdminProfileFormValues = {
  media: UploaderValue | null
  username: string
  userType: string
  biography: string
  neighborhood: string
  websiteUrl: string
  facebookUrl: string
  instagramUrl: string
  twitterUrl: string
  linkedInUrl: string
  doNotIndexProfile: boolean
}

type Props = {
  user: UserAdminProfile_user$key
  query: UserAdminProfile_query$key
  methods: UseFormReturn<UserAdminProfileFormValues>
}

const FRAGMENT = graphql`
  fragment UserAdminProfile_user on User {
    id
    isViewer
    media {
      id
      name
      size
      type: contentType
      url(format: "reference")
    }
    username
    biography
    websiteUrl
    facebookUrl
    linkedInUrl
    twitterUrl
    instagramUrl
    profilePageIndexed
    userType {
      id
    }
    neighborhood
  }
`

const QUERY_FRAGMENT = graphql`
  fragment UserAdminProfile_query on Query {
    userTypes {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`

const getDefaultValues = (user: Omit<UserAdminProfile_user$data, ' $fragmentType'>): UserAdminProfileFormValues => ({
  media: user.media ?? null,
  username: user.username ?? '',
  userType: user.userType?.id ?? '',
  biography: user.biography ?? '',
  neighborhood: user.neighborhood ?? '',
  websiteUrl: user.websiteUrl ?? '',
  facebookUrl: user.facebookUrl ?? '',
  instagramUrl: user.instagramUrl ?? '',
  twitterUrl: user.twitterUrl ?? '',
  linkedInUrl: user.linkedInUrl ?? '',
  doNotIndexProfile: !user.profilePageIndexed,
})

const getSocialNetworkSchema = (regex: RegExp, message: string) =>
  yup
    .string()
    .nullable()
    .test('social-network-url', message, value => !value || (regex.test(value) && isUrl(value)))
    .test('max-length', message, value => !value || value.length <= FIELD_MAX_LENGTH)

// The form is created by the page, so that its unsaved values survive a tab change
export const useUserAdminProfileForm = (userRef: UserAdminProfile_user$key) => {
  const intl = useIntl()
  const user = useFragment(FRAGMENT, userRef)
  const getSocialNetworkMessage = (name: string) =>
    intl.formatMessage({ id: 'error-invalid-socialNetwork-url' }, { SocialNetworkName: name })

  const schema = yup.object().shape({
    username: yup
      .string()
      .notBlank(intl.formatMessage({ id: 'registration.constraints.username.min' }))
      .min(FIELD_MIN_LENGTH, intl.formatMessage({ id: 'registration.constraints.username.min' }))
      .max(FIELD_MAX_LENGTH, intl.formatMessage({ id: '256-characters-maximum-required' }))
      .matches(REGEX_USERNAME, intl.formatMessage({ id: 'registration.constraints.username.symbol' })),
    biography: getOptionalTextSchema(intl, { hasMaxLength: false }),
    neighborhood: getOptionalTextSchema(intl),
    websiteUrl: getOptionalTextSchema(intl),
    facebookUrl: getSocialNetworkSchema(FACEBOOK_REGEX, intl.formatMessage({ id: 'error-invalid-facebook-url' })),
    instagramUrl: getSocialNetworkSchema(INSTAGRAM_REGEX, getSocialNetworkMessage('Instagram')),
    twitterUrl: getSocialNetworkSchema(TWITTER_REGEX, getSocialNetworkMessage('X')),
    linkedInUrl: getSocialNetworkSchema(LINKEDIN_REGEX, getSocialNetworkMessage('LinkedIn')),
  })

  return useForm<UserAdminProfileFormValues>({
    defaultValues: getDefaultValues(user),
    resolver: yupResolver(schema),
  })
}

const UserAdminProfile: React.FC<Props> = ({ user: userRef, query: queryRef, methods }) => {
  const intl = useIntl()
  const formId = React.useId()
  const user = useFragment(FRAGMENT, userRef)
  const { userTypes } = useFragment(QUERY_FRAGMENT, queryRef)
  const { viewerSession } = useAppContext()
  const hasUserType = useFeatureFlag('user_type')
  const hasNoIndexOnProfiles = useFeatureFlag('noindex_on_profiles')
  const { control, formState, handleSubmit, reset } = methods

  // Same rule as the `updateProfilePublicData` access: the user themself or a super admin
  const isDisabled = !user.isViewer && !viewerSession.isSuperAdmin
  // Fields are locked while saving, so that the reset after the response does not erase a newer input
  const areFieldsDisabled = isDisabled || formState.isSubmitting

  const userTypeOptions =
    userTypes?.edges
      ?.map(edge => edge?.node)
      .filter(Boolean)
      .map(userType => ({ value: userType.id, label: userType.name ?? '' })) ?? []

  const onSubmit = async (values: UserAdminProfileFormValues) => {
    const media = Array.isArray(values.media) ? values.media[0] : values.media

    try {
      const response = await UpdateProfilePublicDataMutation.commit({
        input: {
          userId: user.id,
          username: values.username,
          userType: emptyToNull(values.userType),
          biography: emptyToNull(values.biography),
          neighborhood: emptyToNull(values.neighborhood),
          websiteUrl: emptyToNull(values.websiteUrl),
          facebookUrl: emptyToNull(values.facebookUrl),
          instagramUrl: emptyToNull(values.instagramUrl),
          twitterUrl: emptyToNull(values.twitterUrl),
          linkedInUrl: emptyToNull(values.linkedInUrl),
          profilePageIndexed: !values.doNotIndexProfile,
          media: media?.id ?? null,
        },
      })
      const updatedUser = response.updateProfilePublicData?.user
      if (!updatedUser) {
        mutationErrorToast(intl)
        return
      }
      // The server may normalize the values (e.g. the biography is truncated), so the form reflects what was saved
      reset(getDefaultValues(updatedUser))
      successToast(intl.formatMessage({ id: 'admin.update.successful' }))
    } catch {
      mutationErrorToast(intl)
    }
  }

  const renderTextField = (
    name: keyof UserAdminProfileFormValues,
    id: string,
    labelId: string,
    placeholder?: string,
  ) => (
    <FormControl name={name} control={control} isDisabled={areFieldsDisabled} maxWidth="400px">
      <FormLabel htmlFor={id} label={intl.formatMessage({ id: labelId })} />
      <FieldInput type="text" name={name} id={id} control={control} placeholder={placeholder} />
    </FormControl>
  )

  return (
    <Box bg="white" p={6} borderRadius="0 0 8px 8px" width="100%">
      <Flex as="form" id={formId} direction="column" onSubmit={handleSubmit(onSubmit)}>
        <Flex gap={6} mb={4}>
          <Flex direction="column" flex={1}>
            <FormControl name="username" control={control} isDisabled={areFieldsDisabled} isRequired maxWidth="400px">
              <FormLabel htmlFor="profile-form-username" label={intl.formatMessage({ id: 'global.fullname' })} />
              <FieldInput type="text" name="username" id="profile-form-username" control={control} />
            </FormControl>
            {hasUserType ? (
              <FormControl name="userType" control={control} isDisabled={areFieldsDisabled} maxWidth="400px">
                <FormLabel htmlFor="profile-form-userType" label={intl.formatMessage({ id: 'registration.type' })} />
                <FieldInput
                  type="select"
                  name="userType"
                  id="profile-form-userType"
                  control={control}
                  options={userTypeOptions}
                  placeholder={intl.formatMessage({ id: 'registration.select.type' })}
                  clearable
                />
              </FormControl>
            ) : null}
            <FormControl name="biography" control={control} isDisabled={areFieldsDisabled} maxWidth="600px">
              <FormLabel
                htmlFor="public-data-form-biography"
                label={intl.formatMessage({ id: 'form.label_biography' })}
              />
              <FieldInput type="textarea" name="biography" id="public-data-form-biography" control={control} />
            </FormControl>
          </Flex>
          <FormControl name="media" control={control} isDisabled={areFieldsDisabled} width="auto">
            <FormLabel htmlFor="profile_avatar" label={intl.formatMessage({ id: 'sonata.media.provider.image' })} />
            <FieldInput
              id="profile_avatar"
              type="uploader"
              name="media"
              control={control}
              format={AVATAR_FORMAT}
              maxSize={AVATAR_MAX_SIZE}
              size={UPLOADER_SIZE.MD}
              uploadURI={UPLOAD_PATH}
              showThumbnail
            />
          </FormControl>
        </Flex>
        {renderTextField('neighborhood', 'public-data-form-neighborhood', 'form.label_neighborhood')}
        {renderTextField('websiteUrl', 'public-data-form-website', 'form.label_website')}

        <Accordion size={CapUIAccordionSize.sm} mt={4} color="white">
          <Accordion.Item id="social-medias">
            <Accordion.Button>{intl.formatMessage({ id: 'social-medias' })}</Accordion.Button>
            <Accordion.Panel>
              {renderTextField('facebookUrl', 'public-data-form-facebook', 'user.profile.edit.facebook', 'https://')}
              {renderTextField('instagramUrl', 'public-data-form-instagram', 'instagram-profile', 'https://')}
              {renderTextField('twitterUrl', 'public-data-form-twitter', 'user.profile.edit.twitter', 'https://')}
              {renderTextField('linkedInUrl', 'public-data-form-linkedIn', 'show.label_linked_in_url', 'https://')}
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        {!hasNoIndexOnProfiles ? (
          <>
            <FormLabel label={intl.formatMessage({ id: 'confidentialite.title' })} mt={4} mb={2} />
            <FormControl name="doNotIndexProfile" control={control} isDisabled={areFieldsDisabled}>
              <FieldInput type="checkbox" name="doNotIndexProfile" id="profilePageIndexed" control={control}>
                {intl.formatMessage({ id: 'user.profile.edit.profilePageIndexed' })}
              </FieldInput>
            </FormControl>
          </>
        ) : null}

        <Flex mt={6} gap={4}>
          <Button
            id="user-admin-profile-save"
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

export default UserAdminProfile
