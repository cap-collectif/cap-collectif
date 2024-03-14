import React, { useEffect } from 'react'
import { graphql, useRefetchableFragment } from 'react-relay'
import Slider from 'react-slick'
import ProjectEventPreview from '~/components/Event/ProjectEventPreview/ProjectEventPreview'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import Arrow from '~ui/Slider/Arrow'
import IconRounded from '~ui/Icons/IconRounded'
import colors from '~/utils/colors'
import config from '~/config'
import type { StepEventsList_step$key } from '~relay/StepEventsList_step.graphql'
import { useIntl } from 'react-intl'
const settingsSlider = {
  dots: false,
  infinite: false,
  speed: 500,
  prevArrow: (
    <Arrow>
      <IconRounded size={36} borderColor={colors.borderColor}>
        <Icon name={ICON_NAME.chevronLeft} size={18} color={colors.iconGrayColor} />
      </IconRounded>
    </Arrow>
  ),
  nextArrow: (
    <Arrow>
      <IconRounded size={36} borderColor={colors.borderColor}>
        <Icon name={ICON_NAME.chevronRight} size={18} color={colors.iconGrayColor} />
      </IconRounded>
    </Arrow>
  ),
}

type Props = {
  readonly step: StepEventsList_step$key
  readonly filter: string
}

const FRAGMENT = graphql`
  fragment StepEventsList_step on Step
  @argumentDefinitions(
    isFuture: { type: "Boolean" }
    count: { type: "Int!" }
    cursor: { type: "String" }
    orderBy: { type: "EventOrder!" }
  )
  @refetchable(queryName: "StepEventsListRefetchQuery") {
    id
    events(first: $count, orderBy: $orderBy, isFuture: $isFuture, after: $cursor)
      @connection(key: "StepEventsList_events", filters: ["query", "orderBy", "isFuture"]) {
      totalCount
      edges {
        node {
          id
          ...ProjectEventPreview_event
        }
      }
    }
  }
`

export const StepEventsList = ({ step: stepKey, filter }: Props) => {
  const [step, refetch] = useRefetchableFragment(FRAGMENT, stepKey)
  const intl = useIntl()

  const { events } = step

  useEffect(() => {
    if (filter === 'theme.show.status.future') {
      refetch({ isFuture: true })
    } else if (filter === 'finished') {
      refetch({ isFuture: false })
    }
  }, [filter, refetch])

  if (
    events.totalCount === 0 ||
    !events.edges ||
    events.edges
      .filter(Boolean)
      .map(edge => edge.node)
      .filter(Boolean).length === 0
  ) {
    return intl.formatMessage({ id: 'no_events_message' })
  }

  return (
    <Slider
      {...{
        ...settingsSlider,
        slidesToShow: config.isMobile || events.totalCount === 1 ? 1 : 2,
        arrows: events.totalCount > 2 && !config.isMobile,
      }}
    >
      {events.edges &&
        events.edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(event => <ProjectEventPreview event={event} key={event.id} />)}
    </Slider>
  )
}

export default StepEventsList
