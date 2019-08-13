// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { Row } from 'react-bootstrap';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import IntlProvider from './IntlProvider';
import EventAdminFormPage from '../components/Event/Admin/Form/EventAdminFormPage';
import environment, { graphqlError } from '../createRelayEnvironment';
import type {
  EventFormPageAppQueryResponse,
  EventFormPageAppQueryVariables,
} from '~relay/EventFormPageAppQuery.graphql';
import Loader from '../components/Ui/FeedbacksIndicators/Loader';

type Props = {|
  +eventId: string,
|};

export default (data: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query EventFormPageAppQuery($eventId: ID!) {
            event: node(id: $eventId) {
              ...EventAdminFormPage_event
            }
            ...EventAdminFormPage_query
            __typename
          }
        `}
        variables={({ eventId: data.eventId }: EventFormPageAppQueryVariables)}
        render={({ error, props }: { ...ReadyState, props: ?EventFormPageAppQueryResponse }) => {
          if (error) {
            return graphqlError;
          }
          if (props) {
            return <EventAdminFormPage event={props.event} query={props} />;
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
