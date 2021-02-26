// @flow
import * as React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { connect } from 'react-redux';
import { Container } from './EventPage.style';
import EventPageHeader from '~/components/Event/EventPageHeader/EventPageHeader';
import EventPageContent from '~/components/Event/EventPageContent/EventPageContent';
import environment, { graphqlError } from '~/createRelayEnvironment';
import type {
  EventPageQueryResponse,
  EventPageQueryVariables,
} from '~relay/EventPageQuery.graphql';
import Loader from '~ui/FeedbacksIndicators/Loader';
import type { Uuid, State } from '~/types';

type Props = {|
  eventId: Uuid,
  userConnectedId: ?Uuid,
  isAuthenticated: boolean,
|};

const EventPage = ({ eventId, isAuthenticated }: Props) => (
  <QueryRenderer
    environment={environment}
    query={graphql`
      query EventPageQuery($eventId: ID!, $isAuthenticated: Boolean!) {
        ...EventPageHeader_query @arguments(isAuthenticated: $isAuthenticated)
        event: node(id: $eventId) {
          ... on Event {
            ...EventPageHeader_event @arguments(isAuthenticated: $isAuthenticated)
            ...EventPageContent_event @arguments(isAuthenticated: $isAuthenticated)
          }
        }
        viewer @include(if: $isAuthenticated) {
          ...EventPageContent_viewer
        }
      }
    `}
    variables={
      ({
        eventId,
        isAuthenticated,
      }: EventPageQueryVariables)
    }
    render={({ error, props }: { ...ReactRelayReadyState, props: ?EventPageQueryResponse }) => {
      if (error) return graphqlError;

      if (props && props.event) {
        return (
          <Container>
            <EventPageHeader event={props.event} query={props} viewer={props.viewer || null} />
            <EventPageContent event={props.event} viewer={props.viewer || null} />
          </Container>
        );
      }

      return <Loader />;
    }}
  />
);

const mapStateToProps = (state: State) => ({
  isAuthenticated: !!state.user.user,
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(EventPage);
