// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

const Filter = React.createClass({
  propTypes: {
    value: React.PropTypes.any.isRequired,
    values: React.PropTypes.array,
    show: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired
  },

  getDefaultProps(): Object {
    return {
      values: ['popular', 'last', 'old'],
      show: true
    };
  },

  render(): ?React.Element<any> {
    const { onChange, show, value, values } = this.props;
    if (show) {
      return (
        <select className="form-control pull-right" value={value} onChange={onChange}>
          {values &&
            values.map((val: number, index: number): ?React.Element<any> => {
              return (
                <option value={val} key={index}>
                  <FormattedMessage id={`global.filter_${val}`} />
                </option>
              );
            })}
        </select>
      );
    }
    return null;
  }
});

export default Filter;
