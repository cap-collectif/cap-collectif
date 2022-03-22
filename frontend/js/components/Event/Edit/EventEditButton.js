// @flow
import React, { useState } from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { useIntl } from 'react-intl';
import { Button } from '@cap-collectif/ui';
import EventEditModal from './EventEditModal';
import type { EventEditButton_query } from '~relay/EventEditButton_query.graphql';
import type { EventEditButton_event } from '~relay/EventEditButton_event.graphql';

type Props = {|
  query: EventEditButton_query,
  event: EventEditButton_event,
|};

export const EventEditButton = ({ query, event }: Props) => {
  const [show, setShow] = useState(false);
  const intl = useIntl();

  return (
    <>
      <EventEditModal event={event} query={query} show={show} handleClose={() => setShow(false)} />
      <Button
        id="edit-button"
        variantColor="primary"
        variant="primary"
        variantSize="big"
        className="event-edit-button"
        onClick={() => setShow(true)}
        width={['100%', 'auto']}
        justifyContent="center">
        {intl.formatMessage({ id: 'global.edit' })}
      </Button>
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
