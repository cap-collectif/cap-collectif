// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import classNames from 'classnames';
import DatesInterval from '../Utils/DatesInterval';
import type { EventPreview_event } from '~relay/EventPreview_event.graphql';
import DateIcon from '../Ui/Dates/DateIcon';
import { UserAvatarDeprecated } from '../User/UserAvatarDeprecated';
import InlineList from '../Ui/List/InlineList';

type Props = {|
  +event: EventPreview_event,
  +isHighlighted: boolean,
  +isAuthorDisplay: boolean,
|};

export class EventPreview extends React.Component<Props> {
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
      <React.Fragment>
        <div className={`d-flex flex-1-1 event block  block--bordered ${detailClasses}`}>
          <div className="col-md-2 col-sm-2 hidden-xs">
            <DateIcon startAt={event.timeRange.startAt} />
          </div>
          <div className="col-md-10 col-sm-10 col-xs-12 event__body box event-js">
            <h3 className="event__title">
              <a href={event.url} title={event.title}>
                {event.title}
              </a>
            </h3>
            {isAuthorDisplay && (
              <p className="excerpt">
                {event.author && event.author.username && (
                  <React.Fragment>
                    {/* $FlowFixMe */}
                    <UserAvatarDeprecated size={16} user={event.author} />
                    <span className="font-weight-semi-bold">{event.author.username}</span>
                  </React.Fragment>
                )}
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
            <p className="excerpt">
              {event.fullAddress ? (
                <React.Fragment>
                  <i className="cap-marker-1 mr-10" />
                  {event.fullAddress}
                </React.Fragment>
              ) : null}
            </p>
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
      </React.Fragment>
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
