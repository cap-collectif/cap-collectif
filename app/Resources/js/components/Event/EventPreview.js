// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import classNames from 'classnames';
import DatesInterval from '../Utils/DatesInterval';
import type { EventPreview_event } from './__generated__/EventPreview_event.graphql';
import DateIcon from '../Ui/Dates/DateIcon';
import { UserAvatar } from '../User/UserAvatar';

type Props = {
  event: EventPreview_event,
  isHighlighted: ?boolean,
};

export class EventPreview extends React.Component<Props> {
  render() {
    const { event, isHighlighted } = this.props;
    const detailClasses = classNames({
      'highlighted-comment': isHighlighted,
    });
    return (
      <React.Fragment>
        <div className={`event block  block--bordered ${detailClasses}`}>
          <div className="col-md-2 col-sm-2 hidden-xs">
            <DateIcon startAt={event.startAt} />
          </div>
          <div className="col-md-10 col-sm-10 col-xs-12 event__body box event-js">
            <h3 className="event__title">
              <a href={event.url} title={event.title}>
                {event.title}
              </a>
            </h3>
            <p>
              {event.themes &&
                event.themes.length > 0 &&
                event.themes.filter(Boolean).map((theme, key) => (
                  <a className="mr-5 d-ib" key={key} href={theme.url} title={theme.title}>
                    <span className="label label-default">{theme.title}</span>
                  </a>
                ))}
            </p>
            <p className="excerpt">
              {event.author && event.author.username && (
                <div>
                  {/* $FlowFixMe */}
                  <UserAvatar size={16} user={event.author} />
                  <span className="font-weight-semi-bold">{event.author.username}</span>
                </div>
              )}
            </p>
            <p className="excerpt">
              <i className="cap-calendar-1 mr-10" />
              <DatesInterval startAt={event.startAt} endAt={event.endAt} fullDay />
            </p>
            <p className="excerpt">
              {event.fullAddress ? (
                <div>
                  <i className="cap-marker-1 mr-10" />
                  {event.fullAddress}
                </div>
              ) : null}
            </p>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default createFragmentContainer(EventPreview, {
  event: graphql`
    fragment EventPreview_event on Event {
      id
      startAt
      endAt
      title
      fullAddress
      url
      themes {
        id
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
