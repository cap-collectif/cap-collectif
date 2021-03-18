// @flow
import * as React from 'react';
import { Map, Marker, TileLayer } from 'react-leaflet';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import L from 'leaflet';
import { GestureHandling } from 'leaflet-gesture-handling';
import 'leaflet/dist/leaflet.css';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
import Thumbnail from '~ui/Medias/Thumbnail/Thumbnail';
import config from '~/config';
import Fixed from '~ui/Fixed/Fixed';
import ShareButtonDropdownApp from '~/startup/ShareButtonDropdownApp';
import CommentSectionApp from '~/startup/CommentSectionApp';
import ParticipantList from '~/components/Event/ParticipantList/ParticipantList';
import type { EventPageContent_event } from '~relay/EventPageContent_event.graphql';
import type { EventPageContent_viewer } from '~relay/EventPageContent_viewer.graphql';
import ModalParticipantList from '~/components/Event/ModalParticipantList/ModalParticipantList';
import RegisterForm from '~/components/Event/RegisterForm/RegisterForm';
import UserRegister, { unsubscribe } from '~/components/Event/UserRegister/UserRegister';
import EventPageRemoteContent from '~/components/Event/EventPageContent/EventPageRemoteContent';
import { Container, Content, ButtonSubscribe, ButtonUnsubscribe } from './EventPageContent.style';
import ModalEventRegister from '~/components/Event/ModalEventRegister/ModalEventRegister';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';
import EventModerationMotiveView from '~/components/Event/EventModerationMotiveView';
import type { State } from '~/types';

type Props = {|
  +event: EventPageContent_event,
  +viewer?: ?EventPageContent_viewer,
  +hasProposeEventEnabled: boolean,
  intl: IntlShape,
|};

export const EventPageContent = ({ event, viewer, hasProposeEventEnabled, intl }: Props) => {
  const {
    participants,
    commentable,
    media,
    body,
    googleMapsAddress,
    isRegistrationPossible,
    isViewerParticipatingAtEvent,
    viewerDidAuthor,
    isPresential,
  } = event;
  const publicToken =
    '***REMOVED***';
  const [showModalParticipant, setShowModalParticipant] = React.useState<boolean>(false);
  const [showModalRegister, setShowModalRegister] = React.useState<boolean>(false);

  React.useEffect(() => {
    L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling);
  }, []);

  return (
    <Container>
      <Content>
        {viewerDidAuthor && hasProposeEventEnabled && <EventModerationMotiveView event={event} />}

        {media?.url && isPresential && <Thumbnail width="100%" height="400px" image={media.url} />}

        {!isPresential && <EventPageRemoteContent event={event} viewer={viewer} />}

        {body && <WYSIWYGRender className="description" value={body} />}

        {googleMapsAddress && isPresential && (
          <Map
            center={[googleMapsAddress.lat, googleMapsAddress.lng]}
            zoom={10}
            style={{
              height: '300px',
              width: '1OO%',
              zIndex: 1,
            }}
            doubleClickZoom={false}
            gestureHandling>
            <TileLayer
              attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/#/-74.5/40/10">Improve this map</a>'
              url={`https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=${publicToken}`}
            />
            <Marker
              position={[googleMapsAddress.lat, googleMapsAddress.lng]}
              icon={L.icon({
                iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Map_marker.svg',
                iconSize: [20, 20],
                iconAnchor: [20, 40],
              })}
            />
          </Map>
        )}

        <ShareButtonDropdownApp title={event.title} id={event.id} url={event.url} />
      </Content>

      {participants.totalCount > 0 && (
        <ParticipantList event={event} setShowModalParticipant={setShowModalParticipant} />
      )}

      {commentable && isPresential && <CommentSectionApp commentableId={event.id} />}

      {participants.totalCount > 0 && (
        <ModalParticipantList
          event={event}
          show={showModalParticipant}
          onClose={() => setShowModalParticipant(false)}
        />
      )}

      {isRegistrationPossible &&
        (!config.isMobile ? (
          <Fixed position={{ left: '66%' }} width="300px">
            {!isViewerParticipatingAtEvent || !viewer ? (
              <RegisterForm user={viewer} event={event} />
            ) : (
              <UserRegister user={viewer} event={event} />
            )}
          </Fixed>
        ) : (
          <Fixed position={{ bottom: '0', top: 'inherit', left: '0' }} width="100%">
            {!isViewerParticipatingAtEvent ? (
              <ButtonSubscribe type="button" onClick={() => setShowModalRegister(true)}>
                <FormattedMessage id="event_registration.create.register" />
              </ButtonSubscribe>
            ) : (
              <ButtonUnsubscribe type="button" onClick={() => unsubscribe(event.id, intl)}>
                <FormattedMessage id="event_registration.unsubscribe" />
              </ButtonUnsubscribe>
            )}
          </Fixed>
        ))}

      {config.isMobile && (
        <ModalEventRegister
          show={showModalRegister}
          onClose={() => setShowModalRegister(false)}
          user={viewer}
          event={event}
        />
      )}
    </Container>
  );
};

const mapStateToProps = (state: State) => ({
  hasProposeEventEnabled: state.default.features.allow_users_to_propose_events,
});

const EventPageContentConnected = connect<any, any, _, _, _, _>(mapStateToProps)(EventPageContent);

export default createFragmentContainer(EventPageContentConnected, {
  event: graphql`
    fragment EventPageContent_event on Event
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      title
      url
      body
      commentable
      isRegistrationPossible
      isViewerParticipatingAtEvent @include(if: $isAuthenticated)
      viewerDidAuthor @include(if: $isAuthenticated)
      media {
        url
      }
      googleMapsAddress {
        lat
        lng
      }
      participants {
        totalCount
      }
      isPresential
      ...RegisterForm_event
      ...UserRegister_event
      ...ModalEventRegister_event @arguments(isAuthenticated: $isAuthenticated)
      ...ModalParticipantList_event
      ...ParticipantList_event @arguments(isAuthenticated: $isAuthenticated)
      ...EventPageRemoteContent_event @arguments(isAuthenticated: $isAuthenticated)
      ...EventModerationMotiveView_event
    }
  `,
  viewer: graphql`
    fragment EventPageContent_viewer on User {
      id
      ...RegisterForm_user
      ...UserRegister_user
      ...ModalEventRegister_user
      ...EventPageRemoteContent_viewer
    }
  `,
});
