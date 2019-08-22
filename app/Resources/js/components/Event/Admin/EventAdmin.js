// @flow
import * as React from 'react';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import { injectIntl } from 'react-intl';
import { Row } from 'react-bootstrap';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import EventAdminFormPage from './Form/EventAdminFormPage';
import type {
  EventAdminQueryResponse,
  EventAdminQueryVariables,
} from '~relay/EventAdminQuery.graphql';
import Loader from '../../Ui/FeedbacksIndicators/Loader';

export type Props = {|
  +eventId: string,
|};

export class EventAdmin extends React.Component<Props> {
  render() {
    return (
      <>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query EventAdminQuery($eventId: ID!) {
              event: node(id: $eventId) {
                ...EventAdminFormPage_event
              }
            }
          `}
          variables={({ eventId: this.props.eventId }: EventAdminQueryVariables)}
          render={({ error, props }: { ...ReadyState, props: ?EventAdminQueryResponse }) => {
            if (error) {
              return graphqlError;
            }
            if (props) {
              return <EventAdminFormPage event={props.event} />;
            }
            return (
              <Row>
                <Loader />
              </Row>
            );
          }}
        />
      </>
    );
  }
}

export default injectIntl(EventAdmin);
