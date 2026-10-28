import { GetServerSideProps } from 'next'
import moment from 'moment'
import { IntlShape } from 'react-intl'
import * as yup from 'yup'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'
import { fromGlobalId } from '@shared/utils/fromGlobalId'

export const getUserAdminUrl = (userId: string) => `/admin-next/user?id=${userId}`

// Sonata routes retained during the Admin Next migration rollout. Remove them with the migration feature flag.
export const SONATA_USER_LIST_URL = '/admin/capco/user/user/list'
const getSonataUserEditUrl = (userUuid: string) => `/admin/capco/user/user/${encodeURIComponent(userUuid)}/edit`

/**
 * During the rollout, the page is only reachable when the migration feature flag is enabled,
 * otherwise the viewer is sent back to the Sonata edit page of the same user.
 */
export const withUserAdminPageRequired: GetServerSideProps = async context => {
  const globalId = typeof context.query.id === 'string' ? context.query.id : ''
  const userUuid = globalId ? fromGlobalId(globalId).id : ''
  const sonataUrl = userUuid ? getSonataUserEditUrl(userUuid) : SONATA_USER_LIST_URL

  return withFeatureFlagRequired('unstable__sonata_migration_to_admin_next', sonataUrl)(context)
}

// Same rules as the legacy React form (`REGEX_USERNAME`, `SocialNetworkRegexUtils`)
export const REGEX_USERNAME = RegExp("^[a-zA-Z0-9_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u024F-·' ]+$")
export const FACEBOOK_REGEX =
  /(https:\/\/)(?:www\.)?(mbasic.facebook|m\.facebook|facebook|fb)\.(com|me)\/(?:(?:\w\.)*#!\/)?(?:pages\/)?(?:[\w]*\/)*([\w]*)/
export const INSTAGRAM_REGEX =
  /(https:\/\/)(?:www\.)?(mbasic.instagram|m\.instagram|instagram)\.(com|me)\/(?:(?:\w\.)*#!\/)?(?:[\w]*\/)*([\w]*)/
export const TWITTER_REGEX = /(https:\/\/)(?:www\.)?(mbasic\.x|m\.x|x)\.(com|me)\/(?:(?:\w\.)*#!\/)?(?:[\w]*\/)*([\w]*)/
export const LINKEDIN_REGEX =
  /(https:\/\/)(?:www\.)?(mbasic.linkedin|m\.linkedin|linkedin)\.(com|me)\/(?:(?:\w\.)*#!\/)?(?:pages\/)?(?:[\w]*\/)*([\w]*)/

// Limits of the legacy React forms
export const FIELD_MIN_LENGTH = 2
export const FIELD_MAX_LENGTH = 256

// Same constraints as the legacy `Field type="image"`: ALLOWED_IMAGE_MIMETYPES and a 25 MB limit.
export const AVATAR_FORMAT = '.png,.gif,.jpg,.jpeg,.webp'
export const AVATAR_MAX_SIZE = 26214400

// The legacy forms sent `null` for an emptied field
export const emptyToNull = (value: string | null | undefined): string | null =>
  value && value.trim() !== '' ? value : null

// An optional text field: only checked once filled
export const getOptionalTextSchema = (intl: IntlShape, { hasMaxLength = true } = {}) =>
  yup
    .string()
    .nullable()
    .test(
      'min-length',
      intl.formatMessage({ id: 'two-characters-minimum-required' }),
      value => !value || value.length >= FIELD_MIN_LENGTH,
    )
    .test(
      'max-length',
      intl.formatMessage({ id: '256-characters-maximum-required' }),
      value => !hasMaxLength || !value || value.length <= FIELD_MAX_LENGTH,
    )

export const formatDate = (intl: IntlShape, date: string) =>
  intl.formatDate(moment(date).toDate(), { day: 'numeric', month: 'long', year: 'numeric' })
