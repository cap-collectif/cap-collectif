import {
  InputGroup,
  DateInput,
  HourInput,
  BoxPropsOf,
  CapInputSize,
  Box,
  useTheme,
  DateInputProps,
} from '@cap-collectif/ui'
import moment from 'moment'
import { forwardRef, Ref, useEffect, useState, ChangeEvent } from 'react'

export interface DateHourProps extends Omit<BoxPropsOf<'input'>, 'onChange'> {
  readonly isDisabled?: boolean
  readonly isInvalid?: boolean
  readonly variantSize?: CapInputSize
  readonly dateInputProps?: Partial<DateInputProps>
  readonly value?: string
  readonly id?: string
  readonly placeholder?: string
  readonly ref?: Ref<HTMLInputElement | null>
  readonly onChange?: (date: string) => void
}

const DATE_FORMAT = 'YYYY-MM-DD'
const HOUR_FORMAT = 'HH:mm'
const DATE_TIME_FORMAT = `${DATE_FORMAT} ${HOUR_FORMAT}:ss`

export const DateHour = forwardRef<HTMLInputElement, DateHourProps>(
  (
    { onChange, value, id, placeholder, variantSize = CapInputSize.Sm, isDisabled, isInvalid, dateInputProps = {} },
    ref,
  ) => {
    const { colors } = useTheme()

    const [date, setDate] = useState<string | null>(value ? moment(value).format(DATE_FORMAT) : null)

    const [hour, setHour] = useState<string | null>(value ? moment(value).format(HOUR_FORMAT) : '00:00')

    const dateTime = date && hour ? moment(`${date} ${hour}`).format(DATE_TIME_FORMAT) : null

    useEffect(() => {
      if (onChange) {
        onChange(dateTime)
      }
    }, [dateTime])

    return (
      <Box
        sx={{
          '& .cap-date-input': {
            borderRight: '0px !important',
            borderTopRightRadius: '0px !important',
            borderBottomRightRadius: '0px !important',
          },
          '& .cap-date-input + div': { flex: 'none' },
          '& .cap-hour-input': {
            borderLeft: '0px !important',
            borderTopLeftRadius: '0px !important',
            borderBottomLeftRadius: '0px !important',
          },
          '&:focus-within *': !isDisabled && !isInvalid ? { borderColor: `${colors.blue[500]} !important` } : {},
        }}
      >
        {/* @ts-ignore TODO remove the need for important */}
        <InputGroup sx={{ flexWrap: 'nowrap !important' }}>
          <DateInput
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const date = event.target.value || null
              setDate(date)
            }}
            value={date}
            variantSize={variantSize}
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            placeholder={placeholder}
            {...dateInputProps}
            ref={ref}
          />
          <HourInput
            defaultValue={hour}
            value={hour}
            // @ts-ignore TODO : fix DS hourInputType
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const hour = event.target.value || null
              setHour(hour)
            }}
            variantSize={variantSize}
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            id={id}
          />
        </InputGroup>
      </Box>
    )
  },
)

export default DateHour
