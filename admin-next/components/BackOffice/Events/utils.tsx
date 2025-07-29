import { MultipleRadioValue } from '@cap-collectif/form'
import { Locale } from '@components/BackOffice/Posts/Post.type'
import { EventTranslationInput } from '@relay/AddEventMutation.graphql'
import { EventFormWrapperQuery$data, EventRefusedReason, EventReviewStatus } from '@relay/EventFormWrapperQuery.graphql'
import { IntlShape } from 'react-intl'
import { DeepWriteable, Locales, Translations, ViewerSession } from 'types'

type Option = {
  value: string
  label: string
}

export type StepOption = Option & { projectId: string }
type AuthorOption = Option & { isAdmin?: boolean }

export type EventFormValues = Translations<'title' | 'metaDescription' | 'body' | 'link'> & {
  id: string | null
  currentLocale: Locales
  districts: Option[]
  themes: Option[]
  projects: Option[]
  steps: StepOption[]
  author: AuthorOption | null
  customCode: string | null
  startAt: string
  endAt: string | null
  commentable: boolean | null
  address: string | null
  addressText: string | null
  isPublished: boolean
  media: {
    id: string
    url: string
  } | null
  refusedReason: EventRefusedReason | null
  status: MultipleRadioValue | null
  comment: string | null
  authorAgreeToUsePersonalDataForEventOnly: boolean | null
  adminAuthorizeDataTransfer: boolean | null
  maxRegistrations: number | null
  isMeasurable: boolean
  registrationType: RegistrationType
}

export const getInitialValues = (
  isNewEvent: boolean,
  owner: {
    displayName: string
    id: string
  },
  currentLocale: Locales,
  eventData: EventFormWrapperQuery$data,
): Partial<EventFormValues> => {
  if (isNewEvent) {
    return {
      currentLocale,
      author: {
        value: owner.id,
        label: owner.displayName,
      },
      registrationType: RegistrationType.DISABLED,
      steps: [],
      isPublished: false,
    }
  }
  const { event } = eventData
  const defaultValues = {
    id: event.id,
    currentLocale,
    author: event.author,
    media: event.media ?? null,
    startAt: event.timeRange ? event.timeRange.startAt : null,
    endAt: event.timeRange ? event.timeRange.endAt : null,
    addressText: event.googleMapsAddress ? event.googleMapsAddress.formatted : null,
    address: event.googleMapsAddress ? event.googleMapsAddress.json : null,
    projects: event.projects ? (event.projects as DeepWriteable<Option[]>) : [],
    steps: event.steps
      ? event.steps.map(step => ({ label: step.label, value: step.value, projectId: step.project.id }))
      : [],
    themes: event.themes ? (event.themes as DeepWriteable<Option[]>) : [],
    districts: event?.districts?.edges?.map(({ node }) => node) ?? [],
    isPublished: event.enabled ?? null,
    commentable: event.commentable ?? false,
    customCode: event ? event.customCode : null,
    adminAuthorizeDataTransfer: event?.adminAuthorizeDataTransfer || false,
    registrationType: event.guestListEnabled
      ? RegistrationType.PLATFORM
      : event.translations.some(t => !!t.link)
      ? RegistrationType.EXTERNAL
      : RegistrationType.DISABLED,
    maxRegistrations: event.maxRegistrations ?? null,
    isMeasurable: !!event.isMeasurable || !!event.maxRegistrations,
    status: {
      labels: event?.review?.status ? [event?.review?.status] : null,
    },
    comment: event?.review?.comment ?? null,
    refusedReason: event?.review?.refusedReason ?? null,
    authorAgreeToUsePersonalDataForEventOnly: false, // TODO when frontend migration
  }
  if (eventData?.event?.translations) {
    eventData?.event?.translations.map(trans => {
      defaultValues[`${trans.locale}-title`] = trans.title ?? ''
      defaultValues[`${trans.locale}-link`] = trans.link ?? ''
      defaultValues[`${trans.locale}-body`] = trans.body ?? ''
      defaultValues[`${trans.locale}-metaDescription`] = trans.metaDescription ?? ''
    })
  }
  return defaultValues as EventFormValues
}

export const formatTranslations = (data: EventFormValues, platformLocales: Locale[]) => {
  const locales = platformLocales.map(locale => locale.code)
  const translations: EventTranslationInput[] = []
  locales.map(locale => {
    if (data[`${locale}-title`]) {
      translations.push({
        locale: locale,
        title: data[`${locale}-title`] ?? null,
        link:
          data.registrationType === RegistrationType.EXTERNAL && data[`${locale}-link`] ? data[`${locale}-link`] : null,
        body: data[`${locale}-body`] ?? null,
        metaDescription: data[`${locale}-metaDescription`] ?? null,
      })
    }
  })
  return translations
}

export enum RegistrationType {
  PLATFORM = 'PLATFORM',
  EXTERNAL = 'EXTERNAL',
  DISABLED = 'DISABLED',
}

export enum ModerationStatus {
  APPROVED = 'APPROVED',
  REFUSED = 'REFUSED',
  AWAITING = 'AWAITING',
}

export const getRefusedReasons = (
  intl: IntlShape,
): Array<{
  value: EventRefusedReason
  label: string
}> => [
  {
    value: 'OFFENDING',
    label: intl.formatMessage({
      id: 'reporting.status.offending',
    }),
  },
  {
    value: 'OFF_TOPIC',
    label: intl.formatMessage({
      id: 'reporting.status.off_topic',
    }),
  },
  {
    value: 'SEX',
    label: intl.formatMessage({
      id: 'reporting.status.sexual',
    }),
  },
  {
    value: 'SPAM',
    label: intl.formatMessage({
      id: 'reporting.status.spam',
    }),
  },
  {
    value: 'SYNTAX_ERROR',
    label: intl.formatMessage({
      id: 'syntax-error',
    }),
  },
  {
    value: 'WRONG_CONTENT',
    label: intl.formatMessage({
      id: 'reporting.status.error',
    }),
  },
]

export type DisabledParams = {
  viewer: ViewerSession
  allowUsersToProposeEvents: boolean
  isOrg: boolean
  isEventDeleted: boolean
  isAuthorAdmin: boolean
  review: null | { status: ModerationStatus | EventReviewStatus | null }
}
const isBackOfficeView = true // <-- Todo change this once we migrate the frontend view
export const isFieldDisabled = (
  { viewer, allowUsersToProposeEvents, isOrg, isEventDeleted, review, isAuthorAdmin }: DisabledParams,
  adminCanEdit = false,
): boolean => {
  const { isAdmin, isProjectAdmin, isSuperAdmin } = viewer
  const isOnlyProjectAdmin = !isAdmin && isProjectAdmin
  if (isSuperAdmin || isOnlyProjectAdmin || (isAdmin && !allowUsersToProposeEvents) || isOrg) return false
  if (isAdmin && isEventDeleted) return true
  if (isAdmin && (isAuthorAdmin || !review)) return false
  if (isAdmin && review?.status !== null && !adminCanEdit) return true
  return isBackOfficeView && !isAdmin
}
