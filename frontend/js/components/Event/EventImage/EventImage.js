// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import type { EventImage_event } from '~relay/EventImage_event.graphql';
import Image from '~/components/Ui/Medias/Image';
import DefaultEventCover from '../DefaultEventCover';

type EventImageProps = {|
  +event: EventImage_event,
  +enabled: boolean,
  +isHorizontal?: boolean,
|};

const EventImageContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'eventImage',
})`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px 4px 0 0;

  svg,
  path {
    position: absolute;
    height: 100%;
    z-index: 0;
  }
`;

export const EventImage = ({ event, enabled, isHorizontal }: EventImageProps) => {
  const imgURL = event.media && event.media.url ? event.media.url : null;

  return enabled ? (
    <EventImageContainer>
      {imgURL ? (
        <Image src={imgURL} width="100%" height="100%" ariaHidden />
      ) : (
        <DefaultEventCover isHorizontal={isHorizontal} />
      )}
    </EventImageContainer>
  ) : null;
};

export default createFragmentContainer(EventImage, {
  event: graphql`
    fragment EventImage_event on Event {
      media {
        url(format: "default_project")
      }
    }
  `,
});
