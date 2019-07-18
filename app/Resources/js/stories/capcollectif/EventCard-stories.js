// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import classNames from 'classnames';
// $FlowFixMe add support for SVG
import calendarSVG from '../../../../../web/svg/calendar.svg';
import DatesInterval from '../../components/Utils/DatesInterval';
import DateIcon from '../../components/Ui/Dates/DateIcon';
import { UserAvatarDeprecated } from '../../components/User/UserAvatarDeprecated';
import InlineList from '../../components/Ui/List/InlineList';
import { author as authorMock } from '../mocks/users';

const user = authorMock;

const calendar = {
  src: calendarSVG,
  alt: 'illustration-placeholder',
};

type Props = {|
  +isHighlighted: boolean,
  hasAPicture?: boolean,
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
            style={{ backgroundImage: `url('https://picsum.photos/300/400')` }}
          />
        ) : (
          <div className="picture_container" style={{ backgroundColor: '#eeeeee' }}>
            <img className="event__picture" src={calendar.src} alt={calendar.alt} />
          </div>
        )}

        <div className="d-flex event__infos">
          <div className="col-md-2 col-sm-2 hidden-xs">
            <DateIcon startAt="2030-03-10 00:00:00" />
          </div>

          <div className="event__body event-js">
            <h3 className="event__title">
              <a href title="PHPTourDuFuture">
                PHPTourDuFuture
              </a>
            </h3>

            <p className="excerpt">
              {/* $FlowFixMe */}
              <UserAvatarDeprecated size={16} user={user} />
              <span className="font-weight-semi-bold">{user.username}</span>
            </p>

            <p className="excerpt">
              <i className="cap-calendar-1 mr-10" />
              <DatesInterval startAt="2030-03-10 00:00:00" endAt="2032-06-15 00:00:00" fullDay />
            </p>

            <p className="excerpt">
              <React.Fragment>
                <i className="cap-marker-1 mr-10" />
                Tour Eiffel, 75007 Paris
              </React.Fragment>
            </p>

            <div className="excerpt">
              <i className="cap cap-folder-2 mr-10 r-0" />

              <InlineList separator="," className="d-i">
                <li>
                  <a href="https://capco.dev/themes/immobilier" title="Immobilier">
                    Immobilier
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
  .add('default', () => <EventCard hasAPicture />)
  .add('is highlighted', () => <EventCard isHighlighted hasAPicture />)
  .add('without picture', () => <EventCard />);
