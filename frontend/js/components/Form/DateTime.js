// @flow
import React from 'react';
import BaseDateTime from 'react-datetime';
import styled, { type StyledComponent } from 'styled-components';

export type DateTimeInputProps = {|
  placeholder?: string,
  disabled?: boolean,
  required?: boolean,
  name?: string,
  className?: string,
  id?: string,
|};

type Props = {
  value?: any,
  onChange: Function,
  dateTimeInputProps?: DateTimeInputProps,
};

const BasicDateTime: StyledComponent<{}, {}, typeof BaseDateTime> = styled(BaseDateTime)`
  .rdtPicker {
    margin-top: 35px;
  }
`;

class DateTime extends React.Component<Props> {
  static defaultProps: {
    dateTimeInputProps: {
      id: 'datePicker',
    },
  };

  render() {
    const { onChange, dateTimeInputProps } = this.props;
    return (
      <BasicDateTime
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
