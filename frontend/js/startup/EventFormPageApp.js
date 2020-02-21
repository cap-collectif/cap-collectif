// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { Row } from 'react-bootstrap';
import { QueryRenderer, graphql } from 'react-relay';
import IntlProvider from './IntlProvider';
import EventFormPage from '../components/Event/Form/EventFormPage';
import environment, { graphqlError } from '../createRelayEnvironment';
import type {
  EventFormPageAppQueryResponse,
  EventFormPageAppQueryVariables,
} from '~relay/EventFormPageAppQuery.graphql';
import Loader from '../components/Ui/FeedbacksIndicators/Loader';

type Props = {|
  +eventId: string,
  +isAuthenticated: boolean,
|};

export default ({ eventId, isAuthenticated }: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query EventFormPageAppQuery($eventId: ID!, $isAuthenticated: Boolean!) {
            event: node(id: $eventId) {
              ...EventFormPage_event @arguments(isAuthenticated: $isAuthenticated)
            }
            ...EventFormPage_query
            __typename
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
    </IntlProvider>
  </Provider>
);
