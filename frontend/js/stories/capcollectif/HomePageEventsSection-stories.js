// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';
import EventCard from './EventCard-stories';
import { event } from '../mocks/event';

type Props = {|
  event: Object,
|};

const EventContainer = styled.div`
  padding-top: 20px;

  >div{
    width: 48%;
    display: inline-block;
    margin-right: 2%;

    >div{
        width: 100% !important;
    }
  }

  @media (max-width: 1200px) {
    >div{
      width: 70%;
      display: block;
      margin-right: 0;
    }
    
  @media (max-width: 380px) {
    >div{
      width: 100%;
    }
  }
`;

class HomePageEvents extends React.Component<Props> {
  render() {
    return (
      <EventContainer>
        <div>
          <EventCard hasAPicture event={event} />
        </div>
        <div>
          <EventCard hasAPicture event={event} />
        </div>
        <div>
          <EventCard hasAPicture event={event} />
        </div>
        <div>
          <EventCard hasAPicture event={event} />
        </div>
      </EventContainer>
    );
  }
}

storiesOf('Cap Collectif|HomePageEventsSection', module).add('Four events', () => (
  <HomePageEvents event={event} />
));
