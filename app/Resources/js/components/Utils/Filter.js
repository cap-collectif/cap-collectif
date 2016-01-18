import React from 'react';
import {IntlMixin} from 'react-intl';

const Filter = React.createClass({
  propTypes: {
    value: React.PropTypes.any.isRequired,
    values: React.PropTypes.array,
    show: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      values: ['popular', 'last', 'old'],
      show: true,
    };
  },

  render() {
    if (this.props.show) {
      return (
        <select
          className="form-control pull-right"
          value={this.props.value}
          onChange={this.props.onChange}
        >
          {
            this.props.values.map((value, index) => {
              return (
                <option value={value} key={index}>
                  {this.getIntlMessage('global.filter_' + value)}
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
