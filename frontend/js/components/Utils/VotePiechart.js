// @flow
import React from 'react';
import { injectIntl, type IntlShape } from 'react-intl';
import colors from '../../utils/colors';
import PieChart from '../Ui/Chart/PieChart';

type Props = {
  intl: IntlShape,
  ok: number,
  nok: number,
  mitige: number,
  height?: string,
  width?: string,
  innerRadius?: number,
  outerRadius?: number,
};

class VotePiechart extends React.Component<Props> {
  static defaultProps = {
    ok: 0,
    nok: 0,
    mitige: 0,
  };

  render() {
    const { intl, ok, mitige, nok, innerRadius, outerRadius, height, width } = this.props;

    const data = [
      { name: intl.formatMessage({ id: 'global.ok' }), value: ok },
      { name: intl.formatMessage({ id: 'global.mitige' }), value: mitige },
      { name: intl.formatMessage({ id: 'global.nok' }), value: nok },
    ];
    // $FlowFixMe
    if (!__SERVER__ && ok + mitige + nok > 0) {
      return (
        <PieChart
          data={data}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          colors={colors.votes}
          height={height}
          width={width}
        />
      );
    }
    return null;
  }
}

export default injectIntl(VotePiechart);
