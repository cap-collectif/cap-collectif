import React from 'react';
import { IntlMixin } from 'react-intl';
import { Nav } from 'react-bootstrap';
import CounterNavItem from './CounterNavItem';

const CountersNav = React.createClass({
  propTypes: {
    counters: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  countersData: {
    contributions: {
      icon: 'cap cap-file-edit-1',
      label: 'global.counters.contributions',
    },
    votes: {
      icon: 'cap-hand-like-2-1',
      label: 'global.counters.votes',
    },
    contributors: {
      icon: 'cap cap-contacts-1',
      label: 'global.counters.contributors',
    },
    remainingDays: {
      icon: 'cap cap-hourglass-1-1',
      label: 'global.counters.remaining_days',
    },
  },

  render() {
    const { counters } = this.props;
    return (
      <Nav className="counters-nav counters-nav--bordered" bsStyle="pills" justified>
        {
          Object.keys(counters).map((key, index) => {
            if (this.countersData[key]) {
              return (
                <CounterNavItem
                  key={index}
                  counter={counters[key]}
                  icon={this.countersData[key].icon}
                  label={this.getIntlMessage(this.countersData[key].label)}
                />
              );
            }
          })
        }
      </Nav>
    );
  },

});

export default CountersNav;
