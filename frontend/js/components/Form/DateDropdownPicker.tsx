import * as React from 'react'
import config from '../../config'
import moment from 'moment'

type Props = {
  dayDefaultValue: string
  dayId: string
  monthDefaultValue: string
  monthId: string
  yearDefaultValue: string
  yearId: string
  input: Record<string, any>
  label: JSX.Element | JSX.Element[] | string
  componentId: string
  labelClassName: string
  divClassName: string
  globalClassName: string
  disabled: boolean
  css?: CSSRule
}

const getDay = (date: string): number => {
  const day = date.substring(8, 10)
  return parseInt(day, 10)
}

const getMonth = (date: string): number => {
  const month = date.substring(5, 7)
  return parseInt(month, 10)
}

const getYear = (date: string): number => {
  const year = date.substring(0, 4)
  return parseInt(year, 10)
}

type DateState = {
  year: number | null | undefined
  month: number | null | undefined
  day: number | null | undefined
}
let wLocale = 'fr-FR'

if (config.canUseDOM && window.locale) {
  wLocale = window.locale
} else if (!config.canUseDOM) {
  wLocale = global.locale
}

export class DateDropdownPicker extends React.Component<Props, DateState> {
  static defaultProps = {
    dayDefaultValue: 'Jour',
    monthDefaultValue: 'Mois',
    yearDefaultValue: 'Année',
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      year: null,
      month: null,
      day: null,
    }

    if (props.input.value) {
      this.state = {
        year: getYear(props.input.value),
        month: getMonth(props.input.value),
        day: getDay(props.input.value),
      }
    }
  }

  componentDidUpdate(prevProps: Props, prevState: DateState) {
    if (prevState !== this.state) {
      this.setDate()
    }
  }

  setDate = () => {
    const { input } = this.props
    const { day, year, month } = this.state

    if (!year || !month || !day) {
      return
    }

    input.onChange(`${year}-${month}-${day}`)
  }

  render() {
    const {
      dayDefaultValue,
      monthDefaultValue,
      yearDefaultValue,
      dayId,
      monthId,
      yearId,
      label,
      componentId,
      labelClassName,
      divClassName,
      globalClassName,
      disabled,
      css,
    } = this.props
    const { day, year, month } = this.state
    return (
      <div className={globalClassName} css={css}>
        <label htmlFor={dayId} className={labelClassName}>
          {label}
        </label>
        <div className={divClassName} id={componentId}>
          <div id={dayId}>
            <select
              value={day}
              onBlur={e => {
                this.setState({
                  day: parseInt(e.target.value),
                })
              }}
              onChange={e => {
                this.setState({
                  day: parseInt(e.target.value),
                })
              }}
              id="day"
              name="day"
              className="form-control"
              disabled={disabled}
            >
              <option value="">{dayDefaultValue}</option>
              {[...Array(31)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div id={monthId}>
            <select
              value={month}
              onBlur={e => {
                this.setState({
                  month: parseInt(e.target.value),
                })
              }}
              onChange={e => {
                this.setState({
                  month: parseInt(e.target.value),
                })
              }}
              id="month"
              name="month"
              className="form-control"
              style={{ textTransform: 'capitalize' }}
              disabled={disabled}
            >
              <option value="">{monthDefaultValue}</option>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {moment().locale(wLocale).month(i).format('MMMM')}
                </option>
              ))}
            </select>
          </div>
          <div id={yearId}>
            <select
              value={year}
              onBlur={e => {
                this.setState({
                  year: parseInt(e.target.value),
                })
              }}
              onChange={e => {
                this.setState({
                  year: parseInt(e.target.value),
                })
              }}
              id="year"
              name="year"
              className="form-control"
              disabled={disabled}
            >
              <option value="">{yearDefaultValue}</option>
              {[...Array(110)].map((_, i) => (
                <option key={i} value={moment().year() - i}>
                  {moment().year() - i}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    )
  }
}
export default DateDropdownPicker
