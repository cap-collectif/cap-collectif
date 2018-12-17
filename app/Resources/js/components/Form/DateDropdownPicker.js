// @flow
import React, { Component } from 'react';
import { YearPicker, MonthPicker, DayPicker } from 'react-dropdown-date';
import { Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import config from '../../config';

type Props = {
  dayDefaultValue: string,
  dayId: string,
  monthDefaultValue: string,
  monthId: string,
  yearDefaultValue: string,
  yearId: string,
  dayDefaultValue: string,
  input: Object,
  label: string,
  componentId: string,
  labelClassName: string,
  divClassName: string,
  globalClassName: string,
  disabled: boolean,
};

const getDay = (date: string): number => {
  let day = date.substr(8, 2);
  day = day[0] === 0 ? day[1] : day;

  return parseInt(day, 10);
};

const getMonth = (date: string): number => {
  let month = date.substr(5, 2);
  month = month[0] === 0 ? month[1] : month;
  month = parseInt(month, 10);

  return month - 1;
};

const getYear = (date: string): number => {
  const year = date.substr(0, 4);

  return parseInt(year, 10);
};
type DateState = {
  year: ?number,
  month: ?number,
  day: ?number,
};

let wLocale = 'fr-FR';

if (config.canUseDOM && window.locale) {
  wLocale = window.locale;
} else if (!config.canUseDOM) {
  wLocale = global.locale;
}

export class DateDropdownPicker extends Component<Props, DateState> {
  static defaultProps = {
    dayDefaultValue: 'Jour',
    monthDefaultValue: 'Mois',
    yearDefaultValue: 'Année',
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      year: null,
      month: null,
      day: null,
    };
    if (props.input.value) {
      this.state = {
        year: getYear(props.input.value),
        month: getMonth(props.input.value),
        day: getDay(props.input.value),
      };
    }
  }

  componentDidUpdate(prevProps: Props, prevState: DateState) {
    if (prevState !== this.state) {
      this.setDate();
    }
  }

  setDate = () => {
    if (!this.state.year || !this.state.month || !this.state.day) {
      return;
    }
    const month = parseInt(this.state.month, 10) + 1;
    this.props.input.onChange(
      // $FlowFixMe
      `${this.state.year}-${month}-${this.state.day}`,
    );
  };

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
    } = this.props;

    return (
      <div className={globalClassName}>
        <label htmlFor={dayId} className={labelClassName}>
          <FormattedMessage id={label} />
        </label>
        <div className={divClassName} id={componentId}>
          <Col sm={2} md={2} id={dayId}>
            <DayPicker
              defaultValue={dayDefaultValue}
              year={this.state.year}
              month={this.state.month}
              value={this.state.day}
              onChange={day => {
                this.setState({ day });
              }}
              id="day"
              name="day"
              classes="form-control"
              disabled={disabled}
            />
          </Col>
          <Col sm={3} md={3} id={monthId}>
            <MonthPicker
              defaultValue={monthDefaultValue}
              year={this.state.year}
              value={this.state.month}
              onChange={month => {
                this.setState({ month });
              }}
              locale={wLocale.substr(3, 5)}
              id="month"
              name="month"
              classes="form-control"
              disabled={disabled}
            />
          </Col>
          <Col sm={3} md={3} id={yearId}>
            <YearPicker
              defaultValue={yearDefaultValue}
              value={this.state.year}
              onChange={year => {
                this.setState({ year });
              }}
              id="year"
              name="year"
              classes="form-control"
              disabled={disabled}
            />
          </Col>
        </div>
      </div>
    );
  }
}

export default DateDropdownPicker;
