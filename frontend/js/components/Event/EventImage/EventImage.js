// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import type { EventImage_event } from '~relay/EventImage_event.graphql';
import Image from '~/components/Ui/Medias/Image';
import DefaultEventCover from '../DefaultEventCover';
import config from '~/config';

type EventImageProps = {|
  +event: EventImage_event,
  +enabled: boolean,
  +isHorizontal?: boolean,
  +isSmall?: boolean,
|};

const EventImageContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'eventImage',
})`
  svg,
  path {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

export const EventImage = ({ event, enabled, isHorizontal, isSmall }: EventImageProps) => {
  const imgURL = event.media && event.media.url ? event.media.url : null;

  return enabled ? (
    <EventImageContainer>
      {imgURL ? (
        <Image src={imgURL} width="100%" height="100%" ariaHidden />
      ) : (
        <DefaultEventCover isHorizontal={isHorizontal} isSmall={config.isMobile || isSmall} />
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
