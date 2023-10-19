import React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { Alert } from 'react-bootstrap'
import type {
  EventModerationMotiveView_event,
  EventRefusedReason,
} from '~relay/EventModerationMotiveView_event.graphql'
import colors from '~/utils/colors'
type Props = {
  readonly event: EventModerationMotiveView_event
}
const ViewContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  div {
    margin-top: 10px;
  }

  span {
    margin-right: 10px;
    font-size: 18px;
    color: ${colors.gray};
  }

  span:first-child {
    color: ${colors.dark};
    font-weight: 600;
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

export const EventModerationMotiveView = ({ event }: Props) =>
  event.review && event.review.status === 'REFUSED' ? (
    <ViewContainer>
      <FormattedMessage id="admin.action.recent_contributions.trash.input_label" />
      {event.review.refusedReason && event.review.refusedReason !== 'NONE' && (
        <FormattedMessage id={getRefusedReasonMessage(event.review.refusedReason)} />
      )}
      {event.review?.comment && <Alert bsStyle="warning">{event.review?.comment}</Alert>}
    </ViewContainer>
  ) : null
export default createFragmentContainer(EventModerationMotiveView, {
  event: graphql`
    fragment EventModerationMotiveView_event on Event {
      review {
        id
        status
        refusedReason
        comment
      }
    }
  `,
})
