// @flow
import React, { PropTypes } from 'react';
import BaseDateTime from 'react-datetime';

const DateTime = React.createClass({
  propTypes: {
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
  },

  render() {
    const { onChange } = this.props;
    return (
      <BaseDateTime
        {...this.props}
        onChange={value => {
          if (value._isAMomentObject) {
            onChange(value.format('MM/DD/YYYY hh:mm A'));
          }
        }}
      />
    );
  },
});

export default DateTime;
