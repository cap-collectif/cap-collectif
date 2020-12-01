// @flow
import React from 'react';
import BaseDateTime from 'react-datetime';
import styled, { type StyledComponent } from 'styled-components';
import moment from 'moment';

export type DateTimeInputProps = {|
  placeholder?: string,
  disabled?: boolean,
  required?: boolean,
  name?: string,
  className?: string,
  id?: string,
|};

export type TimeConstraintsProps = {|
  hours?: {|
    min?: number,
    max?: number,
    step?: number,
  |},
  minutes?: {|
    min?: number,
    max?: number,
    step?: number,
  |},
  seconds?: {|
    min?: number,
    max?: number,
    step?: number,
  |},
  milliseconds?: {|
    min?: number,
    max?: number,
    step?: number,
  |},
|};

export const DEFAULT_TIME_CONSTRAINTS = {
  hours: null,
  minutes: null,
  seconds: null,
  milliseconds: null,
};

type Props = {
  value?: any,
  onChange: Function,
  dateTimeInputProps?: DateTimeInputProps,
  timeConstraints?: TimeConstraintsProps,
  isValidDate?: (current: moment) => boolean,
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
    const { onChange, dateTimeInputProps, isValidDate, timeConstraints } = this.props;

    return (
      <BasicDateTime
        {...this.props}
        dateFormat="YYYY-MM-DD"
        timeFormat="HH:mm:ss"
        isValidDate={current => (isValidDate ? isValidDate(current) : true)}
        timeConstraints={timeConstraints}
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
