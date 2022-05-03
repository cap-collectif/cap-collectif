// @flow
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import type { EventListProfileQueryResponse } from '~relay/EventListProfileQuery.graphql';
import EventListProfileRefetch from './EventListProfileRefetch';

export type Props = {
  userId?: string,
  isAuthenticated?: boolean,
};

class EventListProfile extends React.Component<Props> {
  render() {
    const { userId, isAuthenticated } = this.props;
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query EventListProfileQuery(
            $userId: ID!
            $orderBy: EventOrder
            $isAuthenticated: Boolean!
          ) {
            user: node(id: $userId) {
              ... on User {
                ...EventListProfileRefetch_user
                  @arguments(orderBy: $orderBy, isAuthenticated: $isAuthenticated)
              }
            }
          }
        `}
        variables={{
          userId,
          orderBy: { field: 'START_AT', direction: 'DESC' },
          isAuthenticated,
        }}
        render={({
          error,
          props,
        }: {
          ...ReactRelayReadyState,
          props: ?EventListProfileQueryResponse,
        }) => {
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

          return <EventListProfileRefetch user={user} />;
        }}
      />
    );
  }
}

export default EventListProfile;
