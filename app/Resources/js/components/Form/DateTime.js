// @flow
import React from 'react';
import BaseDateTime from 'react-datetime';

type Props = {
  value?: any,
  onChange: Function,
  dateTimeInputProps?: Object,
};

class DateTime extends React.Component<Props> {
  static defaultProps: {
    dateTimeInputProps: {
      id: 'datePicker',
    },
  };

  render() {
    const { onChange, dateTimeInputProps } = this.props;
    return (
      <BaseDateTime
        {...this.props}
        dateFormat="YYYY-MM-DD"
        timeFormat="HH:mm:ss"
        inputProps={dateTimeInputProps}
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
