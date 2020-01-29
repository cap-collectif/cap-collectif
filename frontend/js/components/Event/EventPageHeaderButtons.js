// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, useIntl, type IntlShape } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import { graphql, createFragmentContainer } from 'react-relay';
import type { EventPageHeaderButtons_event } from '~relay/EventPageHeaderButtons_event.graphql';
import type { EventPageHeaderButtons_query } from '~relay/EventPageHeaderButtons_query.graphql';

import EventDeleteButton from './Delete/EventDeleteButton';
import EventEditButton from './Edit/EventEditButton';
import UserAvatar from '../User/UserAvatar';
import EventLabelStatus from './EventLabelStatus';
import EventModerationMotiveView from './EventModerationMotiveView';
import type { State, FeatureToggles } from '~/types';

type Props = {|
  event: EventPageHeaderButtons_event,
  query: EventPageHeaderButtons_query,
  features: FeatureToggles,
|};

const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  margin-top: 60px;

  div:last-child {
    margin-top: 20px;
  }
`;

const UserInfos: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
`;

const renderThemes = (event: EventPageHeaderButtons_event, intl: IntlShape) => (
  <>
    {' '}
    <FormattedMessage id="global.in" />
    {event.themes.map((theme, index) => (
      <>
        {index > 0 &&
          (index === event.themes.length - 2
            ? ','
            : ` ${intl.formatMessage({ id: 'event.and' })}`)}{' '}
        <a href={theme.url}>{`${theme.title}`}</a>
      </>
    ))}
    {','}
  </>
);

const renderParticipants = (count: number) => (
  <>
    {' | '}
    <FormattedMessage
      id="event_registration.registered.count"
      values={{
        count,
      }}
    />
  </>
);

export const EventPageHeaderButtons = ({ query, event, features }: Props) => {
  const intl = useIntl();
  return (
    <div>
      <h1>{event.title}</h1>
      <div className="media d-flex align-items-center">
        <UserAvatar className="pull-left" user={event.author} />
        <UserInfos className="media-body">
          <div className="excerpt mr-10">
            {features.profiles ? (
              <a href={event.author && event.author.url}>{event.author && event.author.username}</a>
            ) : (
              event.author && event.author.username
            )}
            {features.themes && event.themes.length > 0 && renderThemes(event, intl)}{' '}
            <FormattedMessage
              id="event.header.date"
              values={{
                date: intl.formatDate(event.createdAt, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
              }}
            />
            {event.participants.edges &&
              event.participants.edges.length > 0 &&
              renderParticipants(event.participants.edges.length)}
          </div>
          {event.viewerDidAuthor && features.allow_users_to_propose_events && (
            <EventLabelStatus event={event} />
          )}
        </UserInfos>
      </div>
      {event.viewerDidAuthor && features.allow_users_to_propose_events && (
        <Container>
          <EventEditButton event={event} query={query} />
          <EventDeleteButton event={event} />
          <EventModerationMotiveView event={event} />
        </Container>
      )}
    </div>
  );
};

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

export default createFragmentContainer(connect(mapStateToProps)(EventPageHeaderButtons), {
  query: graphql`
    fragment EventPageHeaderButtons_query on Query
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...EventEditButton_query @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
  event: graphql`
    fragment EventPageHeaderButtons_event on Event
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      title
      createdAt
      themes {
        id
        url
        title
      }
      participants {
        edges {
          node {
            ... on User {
              id
            }
          }
        }
      }
      author {
        username
        url
        ...UserAvatar_user
      }
      viewerDidAuthor @include(if: $isAuthenticated)
      ...EventLabelStatus_event
      ...EventEditButton_event
      ...EventModerationMotiveView_event
    }
  `,
});
