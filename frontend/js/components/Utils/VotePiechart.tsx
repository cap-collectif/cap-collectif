import React from 'react'
import type { IntlShape } from 'react-intl'
import { injectIntl } from 'react-intl'
import colors from '../../utils/colors'
import PieChart from '../Ui/Chart/PieChart'

type Props = {
  intl: IntlShape
  ok: number
  nok: number
  mitige: number
  height?: string
  width?: string
  innerRadius?: number
  outerRadius?: number
  total: number
}

class VotePiechart extends React.Component<Props> {
  static defaultProps = {
    ok: 0,
    nok: 0,
    mitige: 0,
  }

  render() {
    const { intl, ok, mitige, nok, innerRadius, outerRadius, height, width, total } = this.props
    const okPercent = ((ok / total) * 100).toFixed(2)
    const mitigePercent = ((mitige / total) * 100).toFixed(2)
    const nokPercent = (100 - (Number(okPercent) + Number(mitigePercent))).toFixed(2)
    const data = [
      {
        name: intl.formatMessage({
          id: 'global.ok',
        }),
        value: ok,
        percent: okPercent,
      },
      {
        name: intl.formatMessage({
          id: 'global.mitige',
        }),
        value: mitige,
        percent: mitigePercent,
      },
      {
        name: intl.formatMessage({
          id: 'global.nok',
        }),
        value: nok,
        percent: nokPercent,
      },
    ]

    // @ts-expect-error
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
      )
    }

    return null
  }
}

export default injectIntl(VotePiechart)
