// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Providers from './Providers';
import environment, { graphqlError } from '../createRelayEnvironment';
import EventPageHeaderButtons from '../components/Event/EventPageHeaderButtons';
import type {
  EventPageHeaderButtonsAppQueryResponse,
  EventPageHeaderButtonsAppQueryVariables,
} from '~relay/EventPageHeaderButtonsAppQuery.graphql';

type Props = {|
  eventId: string,
  isAuthenticated: boolean,
|};

export default ({ eventId, isAuthenticated }: Props) => (
  <Providers>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query EventPageHeaderButtonsAppQuery($eventId: ID!, $isAuthenticated: Boolean!) {
            ...EventPageHeaderButtons_query @arguments(isAuthenticated: $isAuthenticated)
            event: node(id: $eventId) {
              ...EventPageHeaderButtons_event @arguments(isAuthenticated: $isAuthenticated)
            }
          }
        `}
        variables={({ eventId, isAuthenticated }: EventPageHeaderButtonsAppQueryVariables)}
        render={({
          error,
          props,
        }: {
          ...ReactRelayReadyState,
          props: ?EventPageHeaderButtonsAppQueryResponse,
        }) => {
          if (error) {
            return graphqlError;
          }
          if (props && props.event) {
            return <EventPageHeaderButtons event={props.event} query={props} />;
          }
          return null;
        }}
      />
    </Providers>
);
