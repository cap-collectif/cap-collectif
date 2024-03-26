import React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'

import styled from 'styled-components'
import type { EventImage_event } from '~relay/EventImage_event.graphql'
import DefaultEventCover from '../DefaultEventCover'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'
import config from '~/config'
import Image from '~ui/Primitives/Image'
type EventImageProps = {
  readonly event: EventImage_event
  readonly enabled: boolean
}
export const EventImageContainer = styled.div.attrs({
  className: 'eventImage',
})`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: auto;
  overflow: hidden;
  ${MAIN_BORDER_RADIUS};
  img {
    object-fit: cover;
  }
  svg,
  path {
    position: absolute;
    height: 100%;
    z-index: 0;
  }
`
export const EventImage = ({ event, enabled }: EventImageProps) => {
  const imgURL = event.media && event.media.url ? event.media.url : null
  return enabled ? (
    <EventImageContainer>
      {imgURL ? (
        <Image src={imgURL} width="100%" height="100%" aria-hidden />
      ) : (
        <DefaultEventCover isMobile={config.isMobile} />
      )}
    </EventImageContainer>
  ) : null
}
export default createFragmentContainer(EventImage, {
  event: graphql`
    fragment EventImage_event on Event {
      media {
        url(format: "reference")
      }
    }
  `,
})
