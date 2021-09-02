// @flow
import React, { lazy, Suspense } from 'react';
import { Row } from 'react-bootstrap';
import { QueryRenderer, graphql } from 'react-relay';
import Providers from './Providers';
import environment, { graphqlError } from '../createRelayEnvironment';
import type {
  EventFormPageAppQueryResponse,
  EventFormPageAppQueryVariables,
} from '~relay/EventFormPageAppQuery.graphql';
import Loader from '../components/Ui/FeedbacksIndicators/Loader';

const EventFormPage = lazy(() =>
  import(/* webpackChunkName: "EventFormPage" */ '~/components/Event/Form/EventFormPage'),
);

type Props = {|
  +eventId: string,
  +isAuthenticated: boolean,
|};

export default ({ eventId, isAuthenticated }: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query EventFormPageAppQuery($eventId: ID!, $isAuthenticated: Boolean!) {
            event: node(id: $eventId) {
              ...EventFormPage_event @arguments(isAuthenticated: $isAuthenticated)
            }
            ...EventFormPage_query
          }
        `}
        variables={
          ({
            eventId,
            isAuthenticated,
          }: EventFormPageAppQueryVariables)
        }
        render={({
          error,
          props,
        }: {
          ...ReactRelayReadyState,
          +props: ?EventFormPageAppQueryResponse,
        }) => {
          if (error) {
            return graphqlError;
          }
          if (props) {
            return <EventFormPage event={props.event} query={props} />;
          }
          return (
            <Row>
              <Loader />
            </Row>
          );
        }}
      />
    </Providers>
  </Suspense>
);
