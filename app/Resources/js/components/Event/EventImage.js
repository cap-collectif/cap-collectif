// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import styled from 'styled-components';
import type { EventImage_event } from '~relay/EventImage_event.graphql';
import { baseUrl } from '../../config';
import Image from '../Ui/Medias/Image';

type Props = {|
  +event: EventImage_event,
  +enabled: boolean,
|};

const PictureContainer = styled.div`
  padding: 0;
  width: 40%;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;

  [src$='svg'] {
    object-fit: unset;
    width: 40%;
    opacity: 0.5;
  }
`;

const FALLBACK_IMAGE = `${baseUrl}/svg/calendar.svg`;

export class EventImage extends React.Component<Props> {
  render() {
    const { event, enabled } = this.props;
    const imgURL = event.media && event.media.url ? event.media.url : null;

    return enabled ? (
      <PictureContainer style={{ backgroundColor: '#eeeeee' }}>
        <Image src={imgURL} width="100%" height="100%" fallBack={FALLBACK_IMAGE} aria-hidden />
      </PictureContainer>
    ) : null;
  }
}

export default createFragmentContainer(EventImage, {
  event: graphql`
    fragment EventImage_event on Event {
      media {
        url(format: "default_project")
      }
    }
  `,
});
