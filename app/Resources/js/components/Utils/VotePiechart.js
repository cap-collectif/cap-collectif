// @flow
import React from 'react';
import { injectIntl, type IntlShape } from 'react-intl';
import colors from '../../utils/colors';
import PieChart from '../Ui/Chart/PieChart';

type Props = {
  intl: IntlShape,
  ok?: number,
  nok?: number,
  mitige?: number,
  height: string,
  width: string,
  innerRadius: number,
  outerRadius: number,
  className?: string
};

class VotePiechart extends React.Component<Props> {
  static defaultProps = {
    ok: 0,
    nok: 0,
    mitige: 0,
    height: '105px',
    width: '280px',
    innerRadius: 15,
    outerRadius: 50,
  };

  render() {
    const { intl, ok, mitige, nok, innerRadius, outerRadius, height, width, className } = this.props;

    const data = [
      { name: intl.formatMessage({ id: 'vote.ok' }), value: ok },
      { name: intl.formatMessage({ id: 'vote.mitige' }), value: mitige },
      { name: intl.formatMessage({ id: 'vote.nok' }), value: nok },
    ]
    // $FlowFixMe
    if (!__SERVER__ && ok + mitige + nok > 0) {
      return (
        <PieChart className={className} data={data} innerRadius={innerRadius} outerRadius={outerRadius} colors={colors.votes} height={height} maxWidth={width} />
      );
    }
    return null;
  }
}

export default injectIntl(VotePiechart);
