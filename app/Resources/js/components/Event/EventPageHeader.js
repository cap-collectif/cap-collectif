// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { FormattedHTMLMessage, FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay';
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
  isAuthenticated: boolean,
  openModal: () => void,
  intl: IntlShape,
};

const renderEventSimpleHeader = (eventPageTitle, textPos) => (
  <div className={`text-${textPos}`}>
    <h1 className="m-0">
      {eventPageTitle ? (
        <FormattedHTMLMessage id={eventPageTitle} />
      ) : (
        <FormattedMessage id="events-list" />
      )}
    </h1>
  </div>
);

export class EventPageHeader extends React.Component<Props> {
  render() {
    const { eventPageTitle, features, isAuthenticated, openModal, intl } = this.props;
    const textPos = features.allow_users_to_propose_events ? 'left pull-left' : 'center';
    return (
      <>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query EventPageHeaderQuery($eventId: ID!, $isAuthenticated: Boolean!) {
              event: node(id: $eventId) {
                ...EventCreateModal_event
              }
              ...EventCreateModal_query @arguments(isAuthenticated: $isAuthenticated)
            }
          `}
          variables={({ eventId: '', isAuthenticated }: EventPageHeaderQueryVariables)}
          render={({
            error,
            props,
          }: {
            ...ReactRelayReadyState,
            props: ?EventPageHeaderQueryResponse,
          }) => {
            if (error) {
              console.log(error); // eslint-disable-line no-console
              return graphqlError;
            }
            if (props) {
              return (
                <div className="container">
                  {renderEventSimpleHeader(eventPageTitle, textPos)}
                  {features.allow_users_to_propose_events && (
                    <div className="pull-right">
                      <EventCreateModal event={props.event} query={props} />
                      <LoginOverlay placement="bottom">
                        <Button
                          type="submit"
                          bsStyle="default"
                          className="mt-5"
                          onClick={() => {
                            openModal();
                          }}>
                          <i className="cap cap-add-1" />
                          <span className="hidden-xs ml-5">
                            {intl.formatMessage({ id: 'event-proposal' })}
                          </span>
                        </Button>
                      </LoginOverlay>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <div className="container">{renderEventSimpleHeader(eventPageTitle, textPos)}</div>
            );
          }}
        />
      </>
    );
  }
}
const mapDispatchToProps = (dispatch: Dispatch) => ({
  openModal: () => {
    dispatch(openEventCreateModal());
  },
});

const mapStateToProps = (state: State) => ({
  features: state.default.features,
  isAuthenticated: !!state.user.user,
});

const container = injectIntl(EventPageHeader);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(container);
