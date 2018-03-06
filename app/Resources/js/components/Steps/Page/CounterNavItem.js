import React from 'react';
import { FormattedMessage } from 'react-intl';

const CounterNavItem = React.createClass({
  propTypes: {
    counter: React.PropTypes.number.isRequired,
    icon: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired
  },

  render() {
    const { icon, label } = this.props;
    const counter = this.props.counter || 0;
    return (
      <li>
        <div className="text-center">
          <i className={icon} /> <span className="value">{`${counter} `}</span>
          <span className="excerpt category">
            <FormattedMessage
              id={label}
              values={{
                num: counter
              }}
            />
          </span>
        </div>
      </li>
    );
  }
});

export default CounterNavItem;
