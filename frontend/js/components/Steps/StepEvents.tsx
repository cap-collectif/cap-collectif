import React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import Slider from 'react-slick'
import ProjectEventPreview from '~/components/Event/ProjectEventPreview/ProjectEventPreview'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import Arrow from '~ui/Slider/Arrow'
import IconRounded from '~ui/Icons/IconRounded'
import colors from '~/utils/colors'
import config from '~/config'
import { Container } from './StepEvents.style'
import type { StepEvents_step } from '~relay/StepEvents_step.graphql'
// TODO There is a lot of duplicate code with <PresentationStepEvents />.
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
  readonly step: StepEvents_step
}
export class StepEvents extends React.Component<Props> {
  render() {
    const { step } = this.props
    const { events } = step

    if (
      events.totalCount === 0 ||
      !events.edges ||
      events.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean).length === 0
    ) {
      // We display nothing in case of empty result
      return null
    }

    return (
      <Container id="StepEvents" className="block">
        <h2 className="h2">
          <FormattedMessage id="global.events" /> <span className="small excerpt">{events.totalCount}</span>
        </h2>
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
      </Container>
    )
  }
}
export default createFragmentContainer(StepEvents, {
  step: graphql`
    fragment StepEvents_step on Step {
      id
      events(orderBy: { field: START_AT, direction: DESC }) {
        totalCount
        edges {
          node {
            id
            ...ProjectEventPreview_event
          }
        }
      }
    }
  `,
})
