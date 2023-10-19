// @ts-nocheck
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import styled from 'styled-components'
import { EventPreview, TYPE_EVENT } from './EventPreview-stories'
import { mediaQueryMobile } from '~/utils/sizes'
import { events as eventsMock } from '../mocks/event'

const EventContainer = styled.ul`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;

  & > li {
    width: 48%;
    margin-bottom: 30px;
  }

  .eventPreview,
  .card {
    height: 100%;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    .listEvent {
      flex-direction: column;

      & > li {
        width: 100%;
      }
    }
  }
`

const HomePageEvents = () => (
  <EventContainer>
    <li key="1">
      <EventPreview />
    </li>
    <li key="2">
      <EventPreview type={TYPE_EVENT.ONLINE} />
    </li>
    <li key="3">
      <EventPreview />
    </li>
    <li key="4">
      <EventPreview type={TYPE_EVENT.ONLINE} />
    </li>
    <li key="5">
      <EventPreview type={TYPE_EVENT.ONLINE} />
    </li>
  </EventContainer>
)

storiesOf('Cap Collectif/HomePageEventsSection', module).add('default', () => <HomePageEvents events={eventsMock} />)
