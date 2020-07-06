// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import Thumbnail from '~ui/Medias/Thumbnail/Thumbnail';
import IconRounded from '~ui/Icons/IconRounded';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import { DateLiveContainer, Date, ButtonJoin } from './EventOnlineThumbnail.style';
import type { EventOnlineThumbnail_event } from '~relay/EventOnlineThumbnail_event.graphql';

type Props = {
  event: EventOnlineThumbnail_event,
  live?: boolean,
  canJoin?: boolean,
};

export const EventOnlineThumbnail = ({ live, canJoin, event }: Props) => {
  return live || canJoin ? (
    <Thumbnail width="100%" height="400px">
      <DateLiveContainer>
        <IconRounded size={36} color="#fff">
          <Icon name={ICON_NAME.calendar} color={colors.darkGray} size={18} />
        </IconRounded>

        <Date>
          <span>
            <FormattedMessage id="live.in" /> {moment(event.timeRange?.startAt).toNow(true)}
          </span>
          {moment(event.timeRange?.startAt).calendar(null, {
            sameDay: '[Today] at h:mm',
            nextDay: '[Tomorrow] [at] h:mm',
            nextWeek: 'D MMMM [at] h:mm',
            lastDay: '[Yesterday] [at] h:mm',
            lastWeek: 'D MMMM [at] h:mm',
            sameElse: 'D MMMM [at] h:mm',
          })}
        </Date>
      </DateLiveContainer>

      {canJoin && (
        <ButtonJoin type="button" onClick={() => 'Join the room'}>
          <Icon name={ICON_NAME.join} color="#fff" size={14} className="mr-10" />
          <FormattedMessage id="join.the.stream" />
        </ButtonJoin>
      )}
    </Thumbnail>
  ) : (
    <Thumbnail width="100%" height="400px">
      <IconRounded size={100} color="#fff">
        <Icon name={ICON_NAME.play} color="#000" size={50} className="ml-10" />
      </IconRounded>
    </Thumbnail>
  );
};

export default createFragmentContainer(EventOnlineThumbnail, {
  event: graphql`
    fragment EventOnlineThumbnail_event on Event {
      timeRange {
        startAt
      }
    }
  `,
});
