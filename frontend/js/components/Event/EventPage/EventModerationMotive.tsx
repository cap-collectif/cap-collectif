import React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import { Text, InfoMessage, CapUIFontSize } from '@cap-collectif/ui'
import type { EventModerationMotive_event$key, EventRefusedReason } from '~relay/EventModerationMotive_event.graphql'
type Props = {
  readonly eventRef: EventModerationMotive_event$key
}
const FRAGMENT = graphql`
  fragment EventModerationMotive_event on Event {
    review {
      id
      status
      refusedReason
      comment
    }
  }
`

const getRefusedReasonMessage = (refusedReason: EventRefusedReason) => {
  switch (refusedReason) {
    case 'OFFENDING':
      return 'reporting.status.offending'

    case 'OFF_TOPIC':
      return 'reporting.status.off_topic'

    case 'SEX':
      return 'reporting.status.sexual'

    case 'SPAM':
      return 'reporting.status.spam'

    case 'SYNTAX_ERROR':
      return 'syntax-error'

    case 'WRONG_CONTENT':
      return 'reporting.status.error'

    default:
      return ''
  }
}

export const EventModerationMotive = ({ eventRef }: Props) => {
  const intl = useIntl()
  const event = useFragment(FRAGMENT, eventRef)
  if (event.review && event.review.status === 'REFUSED')
    return (
      <>
        <Text as="span" fontWeight={600} fontSize={CapUIFontSize.DisplaySmall} lineHeight="initial" mb={4}>
          {intl.formatMessage({
            id: 'admin.action.recent_contributions.unpublish.input_label',
          })}
        </Text>
        <InfoMessage variant="danger" mb="56px">
          {event.review?.refusedReason && event.review.refusedReason !== 'NONE' && (
            <Text as="span" fontSize={[CapUIFontSize.BodyRegular, CapUIFontSize.Headline]} fontWeight={600} color="red.800">
              {intl.formatMessage({
                id: getRefusedReasonMessage(event.review.refusedReason),
              })}
            </Text>
          )}
          {event.review?.comment && (
            <Text as="span" fontSize={CapUIFontSize.BodyRegular} color="red.800">
              {event.review?.comment}
            </Text>
          )}
        </InfoMessage>
      </>
    )
  return null
}
export default EventModerationMotive
