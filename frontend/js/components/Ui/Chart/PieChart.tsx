import * as React from 'react'

import styled from 'styled-components'
import { PieChart as PieChartRechart, Cell, Pie, Tooltip, ResponsiveContainer } from 'recharts'
import { useIntl } from 'react-intl'
import defaultColors from '~/utils/colors'
import config from '~/config'
type Data = {
  readonly name: string
  readonly value: number
  readonly percent: string
}
type Props = {
  data: Array<Data>
  innerRadius?: number
  outerRadius?: number
  colors: Array<string>
  width?: string
  height?: string
}
export const TooltipWrapper = styled.div`
  background-color: #fff;
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid ${defaultColors.borderColor};
  white-space: nowrap;
`
const ContentWrapper = styled.div.attrs({
  className: 'pie-chart__container',
})`
  min-width: ${props => props.width};
  width: ${props => props.width};
  height: ${props => props.height};
  max-width: 100%;
  font-size: 14px;

  .recharts-pie {
    font-weight: 500;
  }

  .recharts-legend-wrapper {
    line-height: normal;
  }
`

const renderTooltip = ({ payload }: { payload: Array<Record<string, any>> }) => {
  if (payload && payload.length > 0) {
    return (
      <TooltipWrapper>
        {payload[0].payload.data.map((d, idx) => (
          <React.Fragment key={idx}>
            {d.name} - {d.value} - {d.percent}%
            <br />
          </React.Fragment>
        ))}
      </TooltipWrapper>
    )
  }

  return null
}

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  index,
  value,
  data,
}: Record<string, any>) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  const biggestValue = Math.max(...data.map(d => d.value))
  if (value !== biggestValue) return null
  return (
    <text x={x} y={y} fill="white" key={index} textAnchor="middle" dominantBaseline="central">
      {value > 0 ? value : ''}
    </text>
  )
}

export const PieChart = ({
  data,
  innerRadius = 10,
  outerRadius = 45,
  colors,
  width = config.isMobile ? '95px' : '115px',
  height = '95px',
}: Props) => {
  const intl = useIntl()
  return (
    <ContentWrapper width={width} height={height}>
      <ResponsiveContainer>
        <PieChartRechart>
          <Tooltip content={renderTooltip} payload={data} />
          <Pie
            data={data.map(d => ({ ...d, data }))}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            stroke="none"
            isAnimationActive={false}
            percent
            dataKey="value"
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                aria-label={intl.formatMessage(
                  {
                    id: 'aria-piechart-label-vote',
                  },
                  {
                    label: entry.name,
                    count: entry.value,
                  },
                )}
                fill={colors[index % colors.length]}
              />
            ))}{' '}
          </Pie>
        </PieChartRechart>
      </ResponsiveContainer>
    </ContentWrapper>
  )
}
export default PieChart
