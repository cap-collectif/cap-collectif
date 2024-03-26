import React from 'react'
import BaseDateTime from 'react-datetime'

import styled from 'styled-components'
import moment from 'moment'
export type DateTimeInputProps = {
  readonly placeholder?: string
  readonly disabled?: boolean
  readonly required?: boolean
  readonly name?: string
  readonly className?: string
  readonly id?: string
}
export type DateProps = {
  readonly closeOnSelect?: boolean
  readonly dateFormat?: string
  readonly timeFormat?: string | boolean
  readonly initialViewDate?: string
}
export type TimeConstraintsProps = {
  hours?: {
    min?: number
    max?: number
    step?: number
  }
  minutes?: {
    min?: number
    max?: number
    step?: number
  }
  seconds?: {
    min?: number
    max?: number
    step?: number
  }
  milliseconds?: {
    min?: number
    max?: number
    step?: number
  }
}
export const DEFAULT_TIME_CONSTRAINTS = {
  hours: null,
  minutes: null,
  seconds: null,
  milliseconds: null,
}
type Props = DateProps & {
  value?: any
  onChange: (...args: Array<any>) => any
  dateTimeInputProps?: DateTimeInputProps
  timeConstraints?: TimeConstraintsProps
  isValidDate?: (current: moment) => boolean
}
const BasicDateTime = styled(BaseDateTime)`
  .rdtPicker {
    margin-top: 35px;
  }
`

class DateTime extends React.Component<Props> {
  static defaultProps: {
    dateTimeInputProps: {
      id: 'datePicker'
    }
  }

  render() {
    const {
      onChange,
      dateTimeInputProps,
      isValidDate,
      timeConstraints,
      dateFormat,
      closeOnSelect,
      initialViewDate,
      timeFormat,
    } = this.props
    return (
      <BasicDateTime
        {...this.props}
        dateFormat="YYYY-MM-DD"
        timeFormat={timeFormat ?? 'HH:mm:ss'}
        isValidDate={current => (isValidDate ? isValidDate(current) : true)}
        timeConstraints={timeConstraints}
        inputProps={dateTimeInputProps}
        closeOnSelect={closeOnSelect}
        viewDate={initialViewDate ? new Date(initialViewDate) : undefined}
        onChange={value => {
          if (value._isAMomentObject) {
            onChange(value.format(dateFormat || 'YYYY-MM-DD HH:mm:ss'))
          }
        }}
      />
    )
  }
}

export default DateTime
