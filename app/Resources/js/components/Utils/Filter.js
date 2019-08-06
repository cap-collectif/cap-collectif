// @flow
import * as React from 'react';
import { injectIntl, type IntlShape } from 'react-intl';

type Props = {
  value: any,
  values?: Array<$FlowFixMe>,
  show?: boolean,
  onChange: Function,
} & { intl: IntlShape };

class Filter extends React.Component<Props> {
  static defaultProps = {
    values: ['popular', 'last', 'old'],
    show: true,
  };

  render() {
    const { onChange, show, value, values, intl } = this.props;
    if (show) {
      return (
        <select className="form-control pull-right" value={value} onBlur={onChange}>
          {values &&
            values.map((val: number, index: number): ?React.Element<any> => (
              <option value={val} key={index}>
                {intl.formatMessage({ id: `global.filter_${val}` })}
              </option>
            ))}
        </select>
      );
    }
    return null;
  }
}

export default injectIntl(Filter);
