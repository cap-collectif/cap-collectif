// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import type { EventListProfileQueryResponse } from '~relay/EventListProfileQuery.graphql';
import EventListProfileRefetch from './EventListProfileRefetch';

type Props = {
  userId?: string,
  isAuthenticated?: boolean,
};

class EventListProfile extends React.Component<Props> {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query EventListProfileQuery($userId: ID!, $orderBy: EventOrder) {
            user: node(id: $userId) {
              ... on User {
                ...EventListProfileRefetch_user @arguments(orderBy: $orderBy)
              }
            }
          }
        `}
        variables={{
          userId: this.props.userId,
          orderBy: { field: 'START_AT', direction: 'DESC' },
        }}
        render={({ error, props }: { props: ?EventListProfileQueryResponse, ...ReadyState }) => {
          if (error) {
            return graphqlError;
          }

          if (!props) {
            return null;
          }

          const { user } = props;

          if (!user) {
            return null;
          }

          /* $FlowFixMe */
          return <EventListProfileRefetch user={user} />;
        }}
      />
    );
  }
}

export default EventListProfile;
