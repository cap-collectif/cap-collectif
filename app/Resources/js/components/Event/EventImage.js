// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import styled from 'styled-components';
import type { EventImage_event } from '~relay/EventImage_event.graphql';
import { baseUrl } from '../../config';

type Props = {|
  +event: EventImage_event,
|};

type State = {|
  imgURL: string,
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

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  [src$='svg'] {
    object-fit: unset;
    width: 40%;
    opacity: 0.5;
  }
`;

const FALLBACK_IMAGE = `${baseUrl}/svg/calendar.svg`;

export class EventImage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { event } = props;
    this.state = {
      imgURL: event.media && event.media.url ? event.media.url : FALLBACK_IMAGE,
    };
  }

  onImageError = () => {
    this.setState({
      imgURL: FALLBACK_IMAGE,
    });
  };

  render() {
    const { imgURL } = this.state;

    return (
      <PictureContainer style={{ backgroundColor: '#eeeeee' }}>
        <img src={`${imgURL}`} onError={this.onImageError} alt="" aria-hidden />
      </PictureContainer>
    );
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
