// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import LeafletMap from './LeafletMap';
import type { EventMap_events } from './__generated__/EventMap_events.graphql';

type Props = {
  events: EventMap_events,
};

export class EventMap extends React.Component<Props> {
  render() {
    const { events } = this.props;
    /* $FlowFixMe please use mapDispatchToProps */
    return <LeafletMap markers={events} defaultMapOptions={{ zoom: 12 }} />;
  }
}

export default createFragmentContainer(EventMap, {
  events: graphql`
    fragment EventMap_events on EventConnection {
      totalCount
      edges {
        node {
          id
          lat
          lng
          url
          address
          startAt
          endAt
          title
        }
      }
    }
  `,
});
