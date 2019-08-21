// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import classNames from 'classnames';
import DatesInterval from '../Utils/DatesInterval';
import type { EventPreview_event } from '~relay/EventPreview_event.graphql';
import DateIcon from '../Ui/Dates/DateIcon';
import { UserAvatarDeprecated } from '../User/UserAvatarDeprecated';
import InlineList from '../Ui/List/InlineList';
import EventImage from './EventImage';

type Props = {|
  +event: EventPreview_event,
  +isHighlighted: boolean,
  +isAuthorDisplay: boolean,
|};

type State = {|
  imgURL: string,
|};

export class EventPreview extends React.Component<Props, State> {
  static defaultProps = {
    isAuthorDisplay: true,
    isHighlighted: false,
  };

  render() {
    const { event, isHighlighted, isAuthorDisplay } = this.props;
    const detailClasses = classNames({
      'highlighted-comment': isHighlighted,
    });

    return (
      <div className={`d-flex flex-1-1 event block--bordered ${detailClasses}`}>
        {/* $FlowFixMe */}
        <EventImage event={event} />

        <div className="d-flex event__infos">
          <div className="event__date hidden-xs">
            <DateIcon startAt={event.timeRange.startAt} />
          </div>

          <div className="event__body event-js">
            <h3 className="event__title">
              <a href={event.url} title={event.title}>
                {event.title}
              </a>
            </h3>
            {isAuthorDisplay && event.author && event.author.username && (
              <p className="excerpt">
                {/* $FlowFixMe */}
                <UserAvatarDeprecated size={16} user={event.author} />
                <span className="font-weight-semi-bold">{event.author.username}</span>
              </p>
            )}
            <p className="excerpt">
              <i className="cap-calendar-1 mr-10" />
              <DatesInterval
                startAt={event.timeRange.startAt}
                endAt={event.timeRange.endAt}
                fullDay
              />
            </p>
            {event.fullAddress ? (
              <p className="excerpt">
                <i className="cap-marker-1 mr-10" />
                {event.fullAddress}
              </p>
            ) : null}
            {event.themes && event.themes.length > 0 && (
              <div className="excerpt">
                <i className="cap cap-folder-2 mr-10 r-0" />
                <InlineList separator="," className="d-i">
                  {event.themes.filter(Boolean).map((theme, key) => (
                    <li key={key}>
                      <a href={theme.url} title={theme.title}>
                        {theme.title}
                      </a>
                    </li>
                  ))}
                </InlineList>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

// No alternative to fullAddress for now…
/* eslint-disable graphql/no-deprecated-fields */
export default createFragmentContainer(EventPreview, {
  event: graphql`
    fragment EventPreview_event on Event {
      id
      timeRange {
        startAt
        endAt
      }
      ...EventImage_event
      title
      fullAddress
      url
      themes {
        title
        url
      }
      author {
        username
        url
        media {
          url
        }
      }
    }
  `,
});
