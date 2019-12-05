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
|};

const EventImageContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'eventImage',
})``;

export const EventImage = ({ event, enabled }: EventImageProps) => {
  const imgURL = event.media && event.media.url ? event.media.url : null;

  return enabled ? (
    <EventImageContainer>
      {imgURL ? (
        <Image src={imgURL} width="100%" height="100%" aria-hidden />
      ) : (
        <DefaultEventCover />
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
