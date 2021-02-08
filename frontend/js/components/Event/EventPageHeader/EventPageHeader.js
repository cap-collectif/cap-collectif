// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import moment from 'moment';
import { Button } from 'react-bootstrap';
import {
  Container,
  TitleContainer,
  InfoContainer,
  TagsList,
  InfoLineContainer,
  ActionContainer,
  UsernameContainer,
} from './EventPageHeader.style';
import UserAvatar from '~/components/User/UserAvatar';
import type { State } from '~/types';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import Tag from '~ui/Labels/Tag';
import IconRounded from '~ui/Icons/IconRounded';
import TagThemes from '~/components/Tag/TagThemes/TagThemes';
import EventEditButton from '~/components/Event/Edit/EventEditButton';
import EventDeleteButton from '~/components/Event/Delete/EventDeleteButton';
import type { EventPageHeader_event } from '~relay/EventPageHeader_event.graphql';
import type { EventPageHeader_query } from '~relay/EventPageHeader_query.graphql';
import EventLabelStatus from '~/components/Event/EventLabelStatus';
import config from '~/config';
import { getTranslation } from '~/services/Translation';
import type { User } from '~/redux/modules/user';

type Props = {|
  +event: EventPageHeader_event,
  +query: EventPageHeader_query,
  +hasProfileEnabled: boolean,
  +hasThemeEnabled: boolean,
  +hasProposeEventEnabled: boolean,
  +link?: string,
  +user?: User,
|};

export const EventPageHeader = ({
  event,
  query,
  hasProfileEnabled,
  hasThemeEnabled,
  hasProposeEventEnabled,
  link,
  user,
}: Props) => {
  const {
    isPresential,
    animator,
    title,
    googleMapsAddress,
    timeRange,
    comments,
    participants,
    themes,
    viewerDidAuthor,
    author,
  } = event;

  const speaker = animator ?? author;

  return (
    <Container>
      <div className="event-header-info">
        <TitleContainer>
          {!config.isMobile && (
            <Icon
              name={!isPresential ? ICON_NAME.eventOnline : ICON_NAME.eventPhysical}
              size={30}
              color={colors.lightBlue}
            />
          )}
          <h1>{title}</h1>
        </TitleContainer>

        <InfoContainer>
          <UserAvatar user={author} size={60} />
          <div>
            <UsernameContainer>
              {hasProfileEnabled && author ? (
                <a href={author.url} className="username">
                  {author.username}
                </a>
              ) : (
                <span className="username">{author && author.username}</span>
              )}

              {viewerDidAuthor && hasProposeEventEnabled && <EventLabelStatus event={event} />}
            </UsernameContainer>

            <TagsList>
              <Tag
                size="16px"
                CustomImage={
                  <IconRounded size={18} color={colors.darkGray}>
                    <Icon name={ICON_NAME.calendar} color="#fff" size={10} />
                  </IconRounded>
                }>
                {timeRange?.startAt && !timeRange?.endAt ? (
                  <FormattedDate
                    value={moment(timeRange.startAt)}
                    day="numeric"
                    month="long"
                    year="numeric"
                    hour="numeric"
                    minute="numeric"
                  />
                ) : (
                  <FormattedMessage
                    id="date.start.to.date.end"
                    values={{
                      dateStart: moment(timeRange.startAt).format('Do MMMM YYYY'),
                      hourStart: moment(timeRange.startAt).format('HH:mm'),
                      dateEnd: moment(timeRange.endAt).format('Do MMMM YYYY'),
                      hourEnd: moment(timeRange.endAt).format('HH:mm'),
                    }}
                  />
                )}
              </Tag>

              {timeRange?.startAt && timeRange?.endAt && !isPresential && (
                <Tag
                  size="16px"
                  CustomImage={
                    <IconRounded size={18} color={colors.darkGray}>
                      <Icon name={ICON_NAME.clock} color="#fff" size={10} />
                    </IconRounded>
                  }>
                  {moment
                    .utc(
                      moment
                        .duration(moment(timeRange.startAt).diff(timeRange.endAt))
                        .as('milliseconds'),
                    )
                    .format('HH:mm')}
                </Tag>
              )}

              {hasThemeEnabled && themes && themes.length > 0 && (
                <TagThemes themes={themes} size="16px" />
              )}

              {speaker && (
                <Tag
                  size="16px"
                  CustomImage={
                    <IconRounded size={18} color={colors.darkGray}>
                      <Icon name={ICON_NAME.micro} color="#fff" size={10} />
                    </IconRounded>
                  }>
                  <FormattedMessage id="driven.by" />
                  {' : '}
                  {speaker.username}
                </Tag>
              )}

              {googleMapsAddress?.formatted && (
                <Tag
                  size="16px"
                  CustomImage={
                    <IconRounded size={18} color={colors.darkGray}>
                      <Icon name={ICON_NAME.pin2} color="#fff" size={10} />
                    </IconRounded>
                  }>
                  {googleMapsAddress.formatted}
                </Tag>
              )}
            </TagsList>
          </div>
        </InfoContainer>

        <InfoLineContainer>
          <div>
            <span className="number">{comments.totalCount}</span>
            <FormattedMessage id="comment.dynamic" values={{ num: comments.totalCount }} />
          </div>
          <div>
            <span className="number">{participants.totalCount}</span>
            <FormattedMessage id="registered.dynamic" values={{ num: participants.totalCount }} />
          </div>
        </InfoLineContainer>

        {(link || (viewerDidAuthor && hasProposeEventEnabled)) && (
          <ActionContainer>
            {link && (
              <a href={link} className="btn btn-primary external-link">
                <FormattedMessage id="event_registration.create.register" />
              </a>
            )}

            {viewerDidAuthor && hasProposeEventEnabled && (
              <>
                {event.review && event.review.status !== 'APPROVED' && (
                  <EventEditButton event={event} query={query} />
                )}
                <EventDeleteButton eventId={event.id} />
              </>
            )}
          </ActionContainer>
        )}
        {user?.isAdmin ? (
          <Button href={event.adminUrl} className="mt-20">
            <i className="cap cap-pencil-1" />
            <FormattedMessage id="event.admin.edit" />
          </Button>
        ) : null}
      </div>
    </Container>
  );
};

const mapStateToProps = (state: State, props: Props) => {
  const translation = props.event?.translations
    ? getTranslation(props.event?.translations, state.language.currentLanguage)
    : undefined;

  return {
    hasProfileEnabled: state.default.features.profiles || false,
    hasThemeEnabled: state.default.features.themes || false,
    hasProposeEventEnabled: state.default.features.allow_users_to_propose_events || false,
    link: translation ? translation?.link : undefined,
    user: state.user.user,
  };
};

const EventPageHeaderConnected = connect(mapStateToProps)(EventPageHeader);

export default createFragmentContainer(EventPageHeaderConnected, {
  query: graphql`
    fragment EventPageHeader_query on Query
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...EventEditButton_query @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
  event: graphql`
    fragment EventPageHeader_event on Event
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      title
      isPresential
      adminUrl
      translations {
        locale
        link
      }
      animator {
        id
        username
      }
      viewerDidAuthor @include(if: $isAuthenticated)
      timeRange {
        startAt
        endAt
      }
      googleMapsAddress {
        formatted
      }
      themes {
        __typename
        ...TagThemes_themes
      }
      author {
        id
        username
        url
        ...UserAvatar_user
      }
      review {
        status
      }
      comments {
        totalCount
      }
      participants {
        totalCount
      }
      ...EventLabelStatus_event
      ...EventEditButton_event
    }
  `,
});
