import { Flex } from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import { BreadCrumbItemType } from '@components/BackOffice/BreadCrumb/BreadCrumbItem'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import { Locale } from '@components/BackOffice/Posts/Post.type'
import { yupResolver } from '@hookform/resolvers/yup'
import AddEventMutation from '@mutations/AddEventMutation'
import ChangeEventMutation from '@mutations/ChangeEventMutation'
import ReviewEventMutation from '@mutations/ReviewEventMutation'
import {
  EventFormWrapperQuery,
  EventFormWrapperQuery$data,
  EventReviewStatus,
} from '@relay/EventFormWrapperQuery.graphql'
import { EventFormWrapper_ViewerQuery } from '@relay/EventFormWrapper_ViewerQuery.graphql'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { isWYSIWYGContentEmpty } from '@shared/utils/isWYSIWYGContentEmpty'
import { dangerToast, mutationErrorToast, successToast } from '@shared/utils/toasts'
import moment from 'moment'
import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay'
import { DeepWriteable, Locales } from 'types'
import * as yup from 'yup'
import EventForm from './EventForm'
import EventFormSide from './EventFormSide'
import { DisabledParams, EventFormValues, formatTranslations, getInitialValues, RegistrationType } from './utils'

type EventFormWrapperProps = {
  eventId?: string
  eventData?: EventFormWrapperQuery$data
}

export const QUERY: GraphQLTaggedNode = graphql`
  query EventFormWrapperQuery($id: ID!) {
    event: node(id: $id) {
      ... on Event {
        ...EventModalConfirmationDelete_event
        id
        timeRange {
          startAt
          endAt
        }
        googleMapsAddress {
          formatted
          json
          lat
          lng
        }
        link
        enabled
        commentable
        customCode
        guestListEnabled
        deletedAt
        themes {
          value: id
          label: title
        }
        projects {
          value: id
          label: title
        }
        steps {
          value: id
          label: title
          project {
            id
          }
        }
        media {
          id
          name
          size
          type: contentType
          url(format: "reference")
        }
        author {
          value: id
          label: displayName
          ... on User {
            isAdmin
          }
        }
        review {
          status
          comment
          refusedReason
          updatedAt
        }
        translations {
          locale
          title
          body
          metaDescription
          link
        }
        authorAgreeToUsePersonalDataForEventOnly
        adminAuthorizeDataTransfer
        maxRegistrations
        isMeasurable
        participants {
          totalCount
        }
        districts {
          edges {
            node {
              value: id
              label: name
            }
          }
        }
      }
    }
  }
`

export const VIEWER_QUERY = graphql`
  query EventFormWrapper_ViewerQuery {
    platformLocales: availableLocales(includeDisabled: false) {
      code
      id
      isDefault
      traductionKey
    }
    viewer {
      id
      displayName
      organizations {
        id
        displayName
      }
    }
  }
`

const formName = 'admin_event_create'

const EventFormWrapper = ({ eventId, eventData }: EventFormWrapperProps) => {
  const intl = useIntl()
  const isNewEvent = !eventId
  const { viewerSession } = useAppContext()
  const { platformLocales, viewer } = useLazyLoadQuery<EventFormWrapper_ViewerQuery>(VIEWER_QUERY, {})
  const organization = viewer.organizations?.[0]
  const owner = organization ?? viewer
  const defaultLocale = platformLocales.find(locale => locale.isDefault)
  const [currentLocale, setCurrentLocale] = React.useState<Locales>(defaultLocale.code as Locales)
  const allowUsersToProposeEvents = useFeatureFlag('allow_users_to_propose_events')
  const disabledParams: DisabledParams = {
    viewer: viewerSession,
    allowUsersToProposeEvents,
    isOrg: !!organization,
    isEventDeleted: eventData?.event?.deletedAt,
    isAuthorAdmin: eventData?.event?.author?.isAdmin,
    review: eventData?.event?.review,
  }
  const { isAdmin, isProjectAdmin } = viewerSession

  const defaultValues = getInitialValues(isNewEvent, owner, defaultLocale.code as Locales, eventData)

  const requiredMessage = intl.formatMessage({ id: 'global.required' })

  const methods = useForm<EventFormValues>({
    mode: 'onSubmit',
    defaultValues,
    resolver: yupResolver(
      (() => {
        // require title/body only for the default locale (fallback to first platform locale)
        const localeFields: Record<string, any> = {}
        const defaultCode = defaultLocale?.code ?? platformLocales?.[0]?.code
        if (defaultCode) {
          const keyTitle = `${defaultCode}-title`
          const keyBody = `${defaultCode}-body`
          localeFields[keyTitle] = yup.string().required(requiredMessage)
          localeFields[keyBody] = yup
            .string()
            .nullable()
            .test('is-not-empty-wysiwyg', requiredMessage, value => !isWYSIWYGContentEmpty(value))
        }

        return yup.object().shape({
          ...localeFields,
          projects: yup.array().when([], {
            is: () => !!organization || (isProjectAdmin && !isAdmin),
            then: yup.array().required(requiredMessage),
            otherwise: yup.array().notRequired(),
          }),
          startAt: yup
            .string()
            .required(requiredMessage)
            .test((value, context) => {
              if (!value && context.parent.endAt) return context.createError({ message: requiredMessage })
              return true
            })
            .nullable(),
          endAt: yup
            .string()
            .test((value, context) => {
              if (value && context.parent.startAt && !moment(context.parent.startAt).isBefore(value))
                return context.createError({ message: intl.formatMessage({ id: 'event-before-date-error' }) })
              return true
            })
            .nullable(),
        })
      })(),
    ),
  })

  const { watch, handleSubmit } = methods

  const title = watch(`${currentLocale}-title`)
  const { setBreadCrumbItems } = useNavBarContext()

  const breadCrumbItems = React.useMemo(() => {
    return [
      {
        title: intl.formatMessage({ id: 'global.events' }),
        href: '/admin-next/events',
      },
      {
        title: title ?? intl.formatMessage({ id: 'admin.event.title' }),
        href: eventId ? `event?id=${eventId}` : 'event',
      },
    ]
  }, [intl, title, eventId])

  React.useEffect(() => {
    setBreadCrumbItems(breadCrumbItems as BreadCrumbItemType[])
    return () => setBreadCrumbItems([])
  }, [breadCrumbItems, setBreadCrumbItems])

  const onSubmit = async (data: EventFormValues) => {
    const input = {
      translations: formatTranslations(data, platformLocales as DeepWriteable<Locale[]>),
      measurable: data.isMeasurable,
      startAt: moment(data.startAt).format('YYYY-MM-DD HH:mm:ss'),
      endAt: data.endAt ? moment(data.endAt).format('YYYY-MM-DD HH:mm:ss') : null,
      customCode: data.customCode,
      commentable: data.commentable || false,
      guestListEnabled: data.registrationType === RegistrationType.PLATFORM,
      addressJson: data.address ? data.address : null,
      enabled: data.isPublished,
      media: data.media?.id ?? null,
      themes: data.themes ? data.themes.map(t => t.value) : null,
      projects: data.projects ? data.projects.map(p => p.value) : null,
      steps: data.steps ? data.steps.map(s => s.value) : null,
      districts: data.districts ? data.districts.map(t => t.value) : null,
      author: data.author ? data.author.value : undefined,
      owner: data.author ? data.author.value : null,
      adminAuthorizeDataTransfer: !!data.adminAuthorizeDataTransfer,
      authorAgreeToUsePersonalDataForEventOnly: false, // Todo with frontend migration
      maxRegistrations:
        data.maxRegistrations &&
        data.isMeasurable &&
        data.registrationType === RegistrationType.PLATFORM &&
        !Number.isNaN(data.maxRegistrations)
          ? Number(data.maxRegistrations)
          : null,
    }

    if (isNewEvent) {
      return AddEventMutation.commit({
        input,
      })
        .then(response => {
          if (response.addEvent.userErrors.length) {
            dangerToast(intl.formatMessage({ id: 'global.saving.error' }))
            return
          }
          successToast(intl.formatMessage({ id: 'event-successfully-created' }))
          const newEventId = response?.addEvent?.eventEdge?.node?.id
          window.location.href = `event?id=${newEventId}`
        })
        .catch(() => {
          mutationErrorToast(intl)
        })
    } else {
      const reviewInput = {
        id: data.id,
        comment: data.comment,
        status: data.status?.labels?.[0] as EventReviewStatus,
        refusedReason: data.refusedReason === 'NONE' ? undefined : data.refusedReason,
      }

      const event = eventData?.event

      return ChangeEventMutation.commit({
        input: {
          ...input,
          id: eventId,
        },
      })
        .then(response => {
          if (response.changeEvent.userErrors.length) {
            dangerToast(intl.formatMessage({ id: 'global.saving.error' }))
            return
          }
          if (
            // TODO : check if frontend view
            event?.review &&
            (event?.review?.status !== data.status?.labels?.[0] ||
              event?.review?.comment !== data.comment ||
              event?.review?.refusedReason !== data.refusedReason)
          ) {
            return ReviewEventMutation.commit({
              input: reviewInput,
            })
              .then(reviewResponse => {
                if (!reviewResponse.reviewEvent || !reviewResponse.reviewEvent.event) mutationErrorToast(intl)
                successToast(intl.formatMessage({ id: 'event-successfully-updated' }))
              })
              .catch(() => mutationErrorToast(intl))
          } else successToast(intl.formatMessage({ id: 'event-successfully-updated' }))
        })
        .catch(() => {
          mutationErrorToast(intl)
        })
    }
  }

  return (
    <FormProvider {...methods}>
      <Flex
        as="form"
        id={formName}
        direction="column"
        alignItems="flex-start"
        spacing={6}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Flex direction="row" width="100%" spacing={6}>
          <Flex direction="column" spacing={6} width="70%">
            <EventForm eventId={eventId} defaultLocale={defaultLocale.code} disabledParams={disabledParams} />
          </Flex>
          <Flex direction="column" spacing={6} width="30%">
            <EventFormSide
              availableLocales={platformLocales as Locale[]}
              currentLocale={currentLocale}
              setCurrentLocale={setCurrentLocale}
              disabledParams={disabledParams}
            />
          </Flex>
        </Flex>
      </Flex>
    </FormProvider>
  )
}

export default EventFormWrapper

export const EventFormWrapperWithData: React.FC<{ eventId: string }> = ({ eventId }) => {
  const node = useLazyLoadQuery<EventFormWrapperQuery>(QUERY, {
    id: eventId,
  })

  return <EventFormWrapper eventData={node} eventId={eventId} />
}
