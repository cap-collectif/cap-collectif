// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import Truncate from 'react-truncate';
import moment from 'moment';
import Card from '~/components/Ui/Card/Card';
import TagCity from '~/components/Tag/TagCity/TagCity';
import EventPreviewContainer, {
  HeadContent,
  Content,
  TagsList,
  TitleContainer,
} from '../EventPreview/EventPreview.style';
import type { ProjectEventPreview_event } from '~relay/ProjectEventPreview_event.graphql';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import Label from '~ui/Labels/Label';
import InlineList from '~ui/List/InlineList';
import IconRounded from '~ui/Icons/IconRounded';
import Tag from '~ui/Labels/Tag';
import {
  getEndDateFromStartAt,
  isEventLive,
} from '~/components/Event/EventPageContent/EventHelperFunctions';

type Props = {|
  +event: ProjectEventPreview_event,
  +className?: string,
|};

export const ProjectEventPreview = ({ event }: Props) => {
  const {
    title,
    googleMapsAddress,
    timeRange,
    isPresential,
    animator,
    author,
    isRecordingPublished,
    guestListEnabled,
    url,
  }: ProjectEventPreview_event = event;
  const startAt = timeRange?.startAt;
  const endAt = timeRange?.endAt;

  const isLive = isEventLive(startAt, endAt);
  const eventAnimator = animator ?? author;

  const isPast = startAt ? moment(new Date()).isAfter(startAt) : false;
  const isStarted = startAt != null ? new Date(startAt).getTime() <= new Date().getTime() : false;
  const isEnded =
    endAt != null
      ? new Date(endAt).getTime() <= new Date().getTime()
      : startAt != null
      ? getEndDateFromStartAt(startAt).getTime() <= new Date().getTime()
      : false;
  const isEventDone = isStarted && isEnded;
  const hasTag =
    (!isPresential && isLive) || (isEventDone && isRecordingPublished) || guestListEnabled;

  return (
    <EventPreviewContainer isProject>
      <Card.Body>
        <TitleContainer>
          <Icon
            name={isPresential ? ICON_NAME.eventPhysical : ICON_NAME.eventOnline}
            size={17}
            color={colors.lightBlue}
          />
          <Card.Title>
            <a href={url} title={title}>
              <Truncate lines={2}>{title}</Truncate>
            </a>
          </Card.Title>
        </TitleContainer>

        <HeadContent>
          {startAt && <Card.Date date={startAt} />}

          {isPast && (
            <div className="past-container">
              <span className="separator">-</span>
              <FormattedMessage id="passed-singular" />
            </div>
          )}

          {hasTag && (
            <InlineList>
              {!isPresential && isLive && (
                <li>
                  <Label color={colors.dangerColor} fontSize={10}>
                    <FormattedMessage id="en-direct" />
                  </Label>
                </li>
              )}

              {isEventDone && isRecordingPublished && (
                <li>
                  <Label color={colors.lightBlue} fontSize={10}>
                    <FormattedMessage id="replay" />
                  </Label>
                </li>
              )}

              {guestListEnabled && (
                <li>
                  <Label color={colors.lightBlue} fontSize={10}>
                    <FormattedMessage id="registration-required" />
                  </Label>
                </li>
              )}
            </InlineList>
          )}
        </HeadContent>

        <Content>
          <TagsList vertical>
            {googleMapsAddress && isPresential && (
              <TagCity address={googleMapsAddress} size="16px" />
            )}

            {eventAnimator && (
              <Tag size="16px">
                <IconRounded size={18} color={colors.darkGray}>
                  <Icon name={ICON_NAME.micro} color="#fff" size={10} />
                </IconRounded>
                {eventAnimator?.username}
              </Tag>
            )}

            {!isPresential && (
              <Tag size="16px">
                <IconRounded size={18} color={colors.darkGray}>
                  <Icon name={ICON_NAME.camera} color="#fff" size={10} />
                </IconRounded>
                <FormattedMessage id="global.online" />
              </Tag>
            )}
          </TagsList>
        </Content>
      </Card.Body>
    </EventPreviewContainer>
  );
};

export default createFragmentContainer(ProjectEventPreview, {
  event: graphql`
    fragment ProjectEventPreview_event on Event {
      id
      title
      url
      isPresential
      isRecordingPublished
      animator {
        username
      }
      author {
        username
      }
      guestListEnabled
      timeRange {
        startAt
        endAt
      }
      googleMapsAddress {
        __typename
        ...TagCity_address
      }
    }
  `,
});
