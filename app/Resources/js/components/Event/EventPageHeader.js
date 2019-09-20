// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay';
import 'react-datetime/css/react-datetime.css';

import LoginOverlay from '../Utils/LoginOverlay';
import type { FeatureToggles, State, Dispatch } from '../../types';
import EventCreateModal from './Create/EventCreateModal';
import { openEventCreateModal } from '../../redux/modules/event';
import environment, { graphqlError } from '../../createRelayEnvironment';
import type {
  EventPageHeaderQueryResponse,
  EventPageHeaderQueryVariables,
} from '~relay/EventPageHeaderQuery.graphql';

type Props = {
  eventPageTitle: ?string,
  features: FeatureToggles,
  +dispatch: Dispatch,
};

export class EventPageHeader extends React.Component<Props> {
  render() {
    const { eventPageTitle, features, dispatch } = this.props;
    const textPos = features.allow_users_to_propose_events ? 'left pull-left' : 'center';
    return (
      <>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query EventPageHeaderQuery($eventId: ID!) {
              event: node(id: $eventId) {
                ...EventCreateModal_event
              }
              ...EventCreateModal_query
            }
          `}
          variables={({ eventId: '' }: EventPageHeaderQueryVariables)}
          render={({
            error,
            props,
          }: {
            ...ReactRelayReadyState,
            props: ?EventPageHeaderQueryResponse,
          }) => {
            if (error) {
              return graphqlError;
            }
            if (props) {
              return (
                <div className="container">
                  <div className={`text-${textPos}`}>
                    <h1 className="m-0">
                      {eventPageTitle ? (
                        <FormattedHTMLMessage id={eventPageTitle} />
                      ) : (
                        <FormattedMessage id="events-list" />
                      )}
                    </h1>
                  </div>
                  {features.allow_users_to_propose_events && (
                    <div className="pull-right">
                      <EventCreateModal event={props.event} query={props} />
                      <LoginOverlay placement="bottom">
                        <Button
                          type="submit"
                          bsStyle="default"
                          className="mt-5"
                          onClick={() => {
                            dispatch(openEventCreateModal());
                          }}>
                          <i className="cap cap-add-1 mr-5" />
                          <FormattedMessage id="event-proposal" />
                        </Button>
                      </LoginOverlay>
                    </div>
                  )}
                </div>
              );
            }
            return null;
          }}
        />
      </>
    );
  }
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

export default connect(mapStateToProps)(EventPageHeader);
