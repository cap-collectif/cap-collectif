// @flow
import React from 'react';
// import { Nav } from 'react-bootstrap';
// import CounterNavItem from './CounterNavItem';
// import classNames from 'classnames';

type Props = {
  counters: Object,
  bordered: boolean,
};

export class CountersNav extends React.Component<Props> {
  static displayName = 'CountersNav';

  static defaultProps = {
    counters: {},
    bordered: false,
  };

  // countersData: {
  //   contributions: {
  //     icon: 'cap cap-file-edit-1',
  //     label: 'global.counters.contributions',
  //   },
  //   proposals: {
  //     icon: 'cap cap-file-edit-1',
  //     label: 'global.counters.proposals',
  //   },
  //   replies: {
  //     icon: 'cap cap-file-edit-1',
  //     label: 'global.counters.replies',
  //   },
  //   votes: {
  //     icon: 'cap-hand-like-2-1',
  //     label: 'global.counters.votes',
  //   },
  //   contributors: {
  //     icon: 'cap cap-contacts-1',
  //     label: 'global.counters.contributors',
  //   },
  //   voters: {
  //     icon: 'cap cap-contacts-1',
  //     label: 'global.counters.voters',
  //   },
  //   remainingDays: {
  //     icon: 'cap cap-hourglass-1-1',
  //     label: 'global.counters.remaining_days',
  //   },
  //   remainingHours: {
  //     icon: 'cap cap-hourglass-1-1',
  //     label: 'global.counters.remaining_hours',
  //   },
  // },

  render() {
    // const { counters } = this.props;
    /* const classes = classNames({
      'counters-nav': true,
      'counters-nav--bordered': this.props.bordered,
    }); */
    // if (Object.keys(counters).length > 0) {
    //   return (
    //     <Nav className={classes} bsStyle="pills" justified>
    //       {
    //         Object.keys(counters).map((key, index) => {
    //           if (this.countersData[key]) {
    //             return (
    //               <CounterNavItem
    //                 key={index}
    //                 counter={counters[key]}
    //                 icon={this.countersData[key].icon}
    //                 label={this.getIntlMessage(this.countersData[key].label)}
    //               />
    //             );
    //           }
    //         })
    //       }
    //     </Nav>
    //   );
    // }
    return null;
  }
}

export default CountersNav;
