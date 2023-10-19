import * as React from 'react'
import { toast, Button } from '@cap-collectif/ui'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { useSelector } from 'react-redux'
import type { RegisterForm_query$key } from '~relay/RegisterForm_query.graphql'
import SubscribeToEventAsRegisteredMutation from '~/mutations/SubscribeToEventAsRegisteredMutation'
import type { GlobalState } from '~/types'
import { getTranslation } from '~/services/Translation'
import EventFormAnonymousModal from './EventFormAnonymousModal'

type Props = {
  queryRef: RegisterForm_query$key
}
const FRAGMENT = graphql`
  fragment RegisterForm_query on Query
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, eventId: { type: "ID!" }) {
    event: node(id: $eventId) {
      ... on Event {
        id
        translations {
          locale
          link
        }
      }
    }
    viewer @include(if: $isAuthenticated) {
      id
    }
  }
`

const onSubmit = (
  values: {
    eventId: string
  },
  intl: IntlShape,
) => {
  const input = {
    eventId: values.eventId,
    private: false,
  }
  return SubscribeToEventAsRegisteredMutation.commit({
    input,
    isAuthenticated: true,
  })
    .then(() => {
      toast({
        variant: 'success',
        content: intl.formatHTMLMessage({
          id: 'event_registration.create.register_success',
        }),
      })
    })
    .catch(() => {
      toast({
        variant: 'danger',
        content: intl.formatHTMLMessage({
          id: 'global.error.server.form',
        }),
      })
    })
}

export const RegisterForm = ({ queryRef }: Props) => {
  const [isAnonymouslyRegistered, setIsAnonymouslyRegistered] = React.useState(false)
  const query = useFragment(FRAGMENT, queryRef)
  const intl = useIntl()
  const { currentLanguage } = useSelector((state: GlobalState) => state.language)
  if (!query) return null
  const { event, viewer } = query
  if (!event || !event.id) return null
  const { id, translations } = event
  const translation = translations ? getTranslation(translations, currentLanguage) : undefined
  const link = translation?.link || undefined
  if (viewer || link)
    return (
      <Button
        as={link ? 'a' : 'button'}
        href={link || undefined}
        target={link ? '_blank' : undefined}
        variantColor="primary"
        variant="primary"
        variantSize="big"
        label="event_registration.create.register"
        onClick={
          link
            ? () => {}
            : () =>
                onSubmit(
                  {
                    eventId: id,
                  },
                  intl,
                )
        }
        disabled={false}
        width={['100%', 'auto']}
        justifyContent="center"
      >
        {intl.formatMessage({
          id: 'global.register',
        })}
      </Button>
    )
  return isAnonymouslyRegistered ? (
    <Button
      variantColor="primary"
      variant="primary"
      variantSize="big"
      label="event_registration.create.register"
      width={['100%', 'auto']}
      justifyContent="center"
      disabled
    >
      {intl.formatMessage({
        id: 'admin.fields.event_registration.registered',
      })}
    </Button>
  ) : (
    <EventFormAnonymousModal eventId={id} register={() => setIsAnonymouslyRegistered(true)} />
  )
}
export default RegisterForm
