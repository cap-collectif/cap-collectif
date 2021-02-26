// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { FormattedHTMLMessage, FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { createFragmentContainer, graphql, QueryRenderer } from 'react-relay';
import LoginOverlay from '../Utils/LoginOverlay';
import type { FeatureToggles, GlobalState } from '~/types';
import EventCreateModal from './Create/EventCreateModal';
import environment, { graphqlError } from '~/createRelayEnvironment';
import type {
  EventListPageHeaderQueryResponse,
  EventListPageHeaderQueryVariables,
} from '~relay/EventListPageHeaderQuery.graphql';
import type { EventListPageHeader_queryViewer } from '~relay/EventListPageHeader_queryViewer.graphql';

type Props = {|
  eventPageTitle: ?string,
  features: FeatureToggles,
  isAuthenticated: boolean,
  intl: IntlShape,
  queryViewer: EventListPageHeader_queryViewer,
|};

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

export const EventListPageHeader = ({
  eventPageTitle,
  features,
  intl,
  isAuthenticated,
  queryViewer,
}: Props) => {
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const textPos = features.allow_users_to_propose_events ? 'left pull-left' : 'center';

  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query EventListPageHeaderQuery($eventId: ID!, $isAuthenticated: Boolean!) {
          event: node(id: $eventId) {
            ...EventCreateModal_event
          }
          ...EventCreateModal_query @arguments(isAuthenticated: $isAuthenticated)
        }
      `}
      variables={({ eventId: '', isAuthenticated }: EventListPageHeaderQueryVariables)}
      render={({
        error,
        props,
      }: {
        ...ReactRelayReadyState,
        props: ?EventListPageHeaderQueryResponse,
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
                  <EventCreateModal
                    event={props.event}
                    query={props}
                    show={showModal}
                    handleClose={() => setShowModal(false)}
                  />
                  <LoginOverlay placement="bottom">
                    <Button
                      id="btn-create-event"
                      type="submit"
                      bsStyle="default"
                      className="mt-5"
                      onClick={() => {
                        if (queryViewer?.viewer?.isAdmin) {
                          window.location.href = `${window.location.protocol}//${window.location.host}/admin/capco/app/event/create`;
                        } else {
                          setShowModal(true);
                        }
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
        return <div className="container">{renderEventSimpleHeader(eventPageTitle, textPos)}</div>;
      }}
    />
  );
};

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
  isAuthenticated: !!state.user.user,
});

export const container = connect<any, any, _, _, _, _>(mapStateToProps)(
  injectIntl(EventListPageHeader),
);

export default createFragmentContainer(container, {
  queryViewer: graphql`
    fragment EventListPageHeader_queryViewer on Query
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      viewer @include(if: $isAuthenticated) {
        isAdmin
      }
    }
  `,
});
