// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import Jitsi from 'react-jitsi';
import type { EventPageRemoteContent_event } from '~relay/EventPageRemoteContent_event.graphql';
import type { EventPageRemoteContent_viewer } from '~relay/EventPageRemoteContent_viewer.graphql';
import EventOnlineThumbnail from '~/components/Event/EventOnlineThumbnail/EventOnlineThumbnail';
import Loader from '~ui/FeedbacksIndicators/Loader';
import {
  getEndDateFromStartAt,
  isEventLive as getIsEventLive,
} from '~/components/Event/EventPageContent/EventHelperFunctions';

type Props = {|
  +event: EventPageRemoteContent_event,
  +viewer?: ?EventPageRemoteContent_viewer,
|};

// TODO type me one day
type JitsiAPI = Object;
type JitsiConfig = Object;

const JITSTI_CONFIG: JitsiConfig = { startWithAudioMuted: true, startWithVideoMuted: true };

export const EventPageRemoteContent = ({ event, viewer }: Props) => {
  const { jitsiToken, roomName, viewerIsRoomAnimator } = event;
  const hasStarted =
    event.timeRange?.startAt != null
      ? new Date(event.timeRange.startAt).getTime() <= new Date().getTime()
      : false;
  const hasEnded =
    event.timeRange.endAt != null
      ? new Date(event.timeRange.endAt).getTime() <= new Date().getTime()
      : event.timeRange.startAt != null
      ? getEndDateFromStartAt(event.timeRange.startAt).getTime() <= new Date().getTime()
      : false;

  const [isJitsiJoined, setJitsiJoined] = React.useState(false);
  const isEventLive = getIsEventLive(event.timeRange.startAt, event.timeRange.endAt);

  const handleJitsiAPI = (api: JitsiAPI) => {
    api.executeCommand('toggleAudio');

    if (event && viewerIsRoomAnimator) {
      api.executeCommand('subject', event.title);
    }

    api.addEventListener('participantJoined', () => {
      if (viewerIsRoomAnimator) {
        api.executeCommand('startRecording');
      }
    });

    api.addEventListener('participantLeft', () => {
      if (viewerIsRoomAnimator) {
        api.executeCommand('stopRecording');
      }
    });

    api.addEventListener('readyToClose', () => {
      setJitsiJoined(false);
    });
  };

  const LoadingComponent = () => {
    return <Loader id="jitsi-loader" />;
  };

  // Jitsi is available when event is live
  // and before the live only for the animator
  const viewerCanAccessJitsi = isEventLive || (!hasEnded && viewerIsRoomAnimator);

  return (
    <div id="jitsi-container">
      {viewerCanAccessJitsi && isJitsiJoined ? (
        <div id="jitsi-live-container">
          <Jitsi
            domain="jitsi.cap-collectif.com"
            loadingComponent={LoadingComponent}
            roomName={roomName}
            displayName={viewer ? viewer.username : `anonymous-${Math.random().toString(10)}`}
            config={JITSTI_CONFIG}
            jwt={jitsiToken}
            onAPILoad={handleJitsiAPI}
          />
        </div>
      ) : (
        <EventOnlineThumbnail
          event={event}
          isJitsiJoined={isJitsiJoined}
          hasStarted={hasStarted}
          hasEnded={hasEnded}
          joinRoom={() => {
            setJitsiJoined(true);
          }}
        />
      )}
    </div>
  );
};

export default createFragmentContainer(EventPageRemoteContent, {
  event: graphql`
    fragment EventPageRemoteContent_event on Event
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      title
      jitsiToken
      roomName
      timeRange {
        startAt
        endAt
      }
      viewerIsRoomAnimator @include(if: $isAuthenticated)
      ...EventOnlineThumbnail_event
    }
  `,
  viewer: graphql`
    fragment EventPageRemoteContent_viewer on User {
      username
    }
  `,
});
