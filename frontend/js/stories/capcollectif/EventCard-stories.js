// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import classNames from 'classnames';
// $FlowFixMe add support for SVG
import calendarSVG from '../../../../public/svg/calendar.svg';
import DatesInterval from '../../components/Utils/DatesInterval';
import DateIcon from '../../components/Ui/Dates/DateIcon';
import { UserAvatarDeprecated } from '../../components/User/UserAvatarDeprecated';
import InlineList from '../../components/Ui/List/InlineList';
import { event } from '../mocks/event';

const calendar = {
  src: calendarSVG,
  alt: 'illustration-placeholder',
};

type Props = {|
  +isHighlighted?: boolean,
  hasAPicture?: boolean,
  event: Object,
|};

class EventCard extends React.Component<Props> {
  static defaultProps = {
    isHighlighted: false,
  };

  render() {
    const { isHighlighted, hasAPicture } = this.props;
    const detailClasses = classNames({
      'highlighted-comment': isHighlighted,
    });
    return (
      <div
        className={`d-flex flex-1-1 event block block--bordered ${detailClasses}`}
        style={{ width: '65%' }}>
        {hasAPicture ? (
          <div
            className="picture_container"
            style={{ backgroundImage: `url(${event.image.url})` }}
          />
        ) : (
          <div className="picture_container" style={{ backgroundColor: '#eeeeee' }}>
            <img className="event__picture" src={calendar.src} alt={calendar.alt} />
          </div>
        )}

        <div className="d-flex event__infos">
          <div className="event__date hidden-xs">
            <DateIcon startAt={event.date.start} />
          </div>

          <div className="event__body event-js">
            <h3 className="event__title">
              <a href={event.url} title={event.title}>
                {event.title}
              </a>
            </h3>

            <p className="excerpt">
              {/* $FlowFixMe */}
              <UserAvatarDeprecated size={16} user={event.user} />
              <span className="font-weight-semi-bold">{event.user.username}</span>
            </p>

            <p className="excerpt">
              <i className="cap-calendar-1 mr-10" />
              <DatesInterval startAt={event.date.start} endAt={event.date.end} fullDay />
            </p>

            <p className="excerpt">
              <React.Fragment>
                <i className="cap-marker-1 mr-10" />
                {event.location.place}, {event.location.zip} {event.location.city}
              </React.Fragment>
            </p>

            <div className="excerpt">
              <i className="cap cap-folder-2 mr-10 r-0" />

              <InlineList separator="," className="d-i">
                <li>
                  <a href="https://capco.dev/themes/immobilier" title="Immobilier">
                    {event.category}
                  </a>
                </li>
              </InlineList>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

storiesOf('Cap Collectif|EventCard', module)
  .add('default', () => <EventCard hasAPicture event={event} />)
  .add('is highlighted', () => <EventCard isHighlighted hasAPicture event={event} />)
  .add('without picture', () => <EventCard event={event} />);

export default EventCard;
