// @Flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { Row } from 'react-bootstrap';
// eslint-disable-next-line flowtype/no-types-missing-file-annotation
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import IntlProvider from './IntlProvider';
import EventAdminFormPage from '../components/Event/Admin/Form/EventAdminFormPage';
import environment, { graphqlError } from '../createRelayEnvironment';
// eslint-disable-next-line flowtype/no-types-missing-file-annotation
import type {
  EventFormPageAppQueryResponse,
  EventFormPageAppQueryVariables,
} from '~relay/EventFormPageAppQuery.graphql';
import Loader from '../components/Ui/FeedbacksIndicators/Loader';

// eslint-disable-next-line flowtype/no-types-missing-file-annotation
type Props = {|
  +eventId: string,
|};

// eslint-disable-next-line flowtype/no-types-missing-file-annotation
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
        /* eslint-disable-next-line flowtype/no-types-missing-file-annotation */
        variables={({ eventId: data.eventId }: EventFormPageAppQueryVariables)}
        /* eslint-disable-next-line flowtype/no-types-missing-file-annotation */
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
