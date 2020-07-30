// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import moment from 'moment';
import { selectUnit } from '@formatjs/intl-utils';
// $FlowFixMe TODO (#10952) component FormattedRelativeTime is not typed
import { FormattedMessage, FormattedDate, FormattedTime, FormattedRelativeTime } from 'react-intl';
import Thumbnail from '~ui/Medias/Thumbnail/Thumbnail';
import IconRounded from '~ui/Icons/IconRounded';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import { DateLiveContainer, Date, ButtonJoin } from './EventOnlineThumbnail.style';
import type { EventOnlineThumbnail_event } from '~relay/EventOnlineThumbnail_event.graphql';

type Props = {|
  +event: EventOnlineThumbnail_event,
  +hasEnded: boolean,
  +hasStarted: boolean,
  +isJitsiJoined: boolean,
  +joinRoom: () => void,
|};

export const EventOnlineThumbnail = ({
  isJitsiJoined,
  hasEnded,
  hasStarted,
  event,
  joinRoom,
}: Props) => {
  const { isRecordingPublished, recordingUrl, viewerIsRoomAnimator } = event;

  const renderReplay = () => {
    if (!isRecordingPublished) {
      // Right now we display nothing when the replay is not published.
      return null;
    }
    if (!recordingUrl) {
      // eslint-disable-next-line no-console
      console.error('Something went wrong with this event replay URL…');
      return null;
    }
    return (
      <div id="jitsi-replay-container">
        <video width="100%" height="400px" controls>
          <source src={recordingUrl} type="video/mp4" />
          <track kind="captions" />
        </video>
      </div>
    );
  };

  const renderWaitingForLive = () => {
    const { value, unit } = selectUnit(moment(event.timeRange?.startAt).toDate());
    const viewerCanJoin = viewerIsRoomAnimator || hasStarted;
    return (
      <Thumbnail width="100%" height="400px">
        {!hasStarted && (
          <DateLiveContainer>
            <IconRounded size={36} color="#fff">
              <Icon name={ICON_NAME.calendar} color={colors.darkGray} size={18} />
            </IconRounded>
            <Date>
              <span>
                <strong>
                  <FormattedMessage id="live.in" />{' '}
                  <FormattedRelativeTime unit={unit} value={value} />
                </strong>
              </span>
              <span>
                <FormattedDate
                  value={moment(event.timeRange?.startAt).toDate()}
                  day="numeric"
                  month="long"
                  year="numeric"
                />{' '}
                <FormattedTime
                  value={moment(event.timeRange?.startAt).toDate()}
                  hour="numeric"
                  minute="numeric"
                  second="numeric"
                />
              </span>
            </Date>
          </DateLiveContainer>
        )}

        {viewerCanJoin && (
          <ButtonJoin id="jitsi-join-button" type="button" onClick={joinRoom}>
            <Icon name={ICON_NAME.join} color="#fff" size={14} className="mr-10 join-icon" />
            <FormattedMessage id="join.the.stream" />
          </ButtonJoin>
        )}
      </Thumbnail>
    );
  };

  if (isJitsiJoined) {
    return null;
  }

  return hasEnded ? renderReplay() : renderWaitingForLive();
};

export default createFragmentContainer(EventOnlineThumbnail, {
  event: graphql`
    fragment EventOnlineThumbnail_event on Event {
      timeRange {
        startAt
      }
      viewerIsRoomAnimator
      isRecordingPublished
      recordingUrl
    }
  `,
});
