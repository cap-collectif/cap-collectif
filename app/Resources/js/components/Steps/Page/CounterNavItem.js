// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
  counter: number,
  icon: string,
  label: string,
};

class CounterNavItem extends React.Component<Props> {
  render() {
    const { icon, label, counter } = this.props;
    return (
      <li>
        <div className="text-center">
          <i className={icon} /> <span className="value">{`${counter || 0} `}</span>
          <span className="excerpt category">
            <FormattedMessage
              id={label}
              values={{
                num: counter,
              }}
            />
          </span>
        </div>
      </li>
    );
  }
}

export default CounterNavItem;
