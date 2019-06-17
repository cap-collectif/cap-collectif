// @flow
import React from 'react';
import BaseDateTime from 'react-datetime';

type Props = {
  value?: any,
  onChange: Function,
};

class DateTime extends React.Component<Props> {
  render() {
    const { onChange } = this.props;
    return (
      <BaseDateTime
        {...this.props}
        dateFormat='YYYY-MM-DD'
        timeFormat='HH:mm:ss'
        onChange={value => {
          if (value._isAMomentObject) {
            onChange(value.format('YYYY-MM-DD HH:mm:ss'));
          }
        }}
      />
    );
  }
}

export default DateTime;
