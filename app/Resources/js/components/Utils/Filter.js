// @flow
import React from 'react';
import { IntlMixin } from 'react-intl';

const Filter = React.createClass({
  propTypes: {
    value: React.PropTypes.any.isRequired,
    values: React.PropTypes.array,
    show: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps(): Object {
    return {
      values: ['popular', 'last', 'old'],
      show: true,
    };
  },

  render(): ?React$Element<> {
    const {
      onChange,
      show,
      value,
      values,
    } = this.props;
    if (show) {
      return (
        <select
          className="form-control pull-right"
          value={value}
          onChange={onChange}
        >
          {
            values && values.map((val: number, index: number): ?React$Element<> => {
              return (
                <option value={val} key={index}>
                  {this.getIntlMessage(`global.filter_${val}`)}
                </option>
              );
            })
          }
        </select>
      );
    }
    return null;
  },

});

export default Filter;
