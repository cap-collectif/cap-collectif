// @flow
import React, { useState } from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import EditButton from '~/components/Form/EditButton';
import EventEditModal from './EventEditModal';
import type { EventEditButton_query } from '~relay/EventEditButton_query.graphql';
import type { EventEditButton_event } from '~relay/EventEditButton_event.graphql';

type Props = {|
  query: EventEditButton_query,
  event: EventEditButton_event,
|};

export const EventEditButton = ({ query, event }: Props) => {
  const [show, setShow] = useState(false);

  return (
    <>
      <EventEditModal event={event} query={query} show={show} handleClose={() => setShow(false)} />
      <EditButton
        author={{ uniqueId: event.author?.slug }}
        className="mr-10"
        onClick={() => setShow(true)}
      />
    </>
  );
};

export default createFragmentContainer(EventEditButton, {
  query: graphql`
    fragment EventEditButton_query on Query
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...EventEditModal_query @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
  event: graphql`
    fragment EventEditButton_event on Event {
      ...EventEditModal_event
      ... on Event {
        author {
          slug
        }
      }
    }
  `,
});
