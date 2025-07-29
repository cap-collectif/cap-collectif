import type { FC } from 'react'
import { Box, BoxProps, useTheme, Text } from '@cap-collectif/ui'
import {
  LineChart as LineChartRecharts,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { formatBigNumber } from '@utils/format-number'
import { Payload } from 'recharts/types/component/DefaultTooltipContent'

type Data = {
  date: string
  value: number
}

export interface LineChartProps extends BoxProps {
  withGrid?: boolean
  withAxis?: boolean
  withTooltip?: boolean
  data: Data[]
  label: string
}

const renderTooltip = ({ payload }: { payload?: Payload<number, string>[] }, label: string) =>
  payload && payload[0] ? (
    <Box bg="blue.800" borderRadius="normal" p={1}>
      <Text color="blue.200">{payload[0].payload.date}</Text>
      <Text color="white">{`${formatBigNumber(payload[0]?.value || 0)} ${label}`}</Text>
    </Box>
  ) : null

const LineChart: FC<LineChartProps> = ({
  data,
  label,
  withGrid = false,
  withAxis = false,
  withTooltip = true,
  ...props
}: LineChartProps) => {
  const { colors } = useTheme()

  return (
    <Box width="100%" height="100%" {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChartRecharts data={data}>
          <defs>
            <linearGradient id="colorLine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.blue['700']} />
              <stop offset="100%" stopColor={colors.blue['300']} />
            </linearGradient>
          </defs>

          {withAxis && <XAxis dataKey="date" />}
          {withAxis && <YAxis />}
          {withGrid && <CartesianGrid strokeDasharray="3 3" />}

          {data.length === 1 && <ReferenceLine y={data[0].value} stroke={colors.blue['700']} strokeWidth={2} />}

          <Line
            type="monotone"
            dataKey="value"
            stroke="url(#colorLine)"
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />

          {withTooltip && (
            <Tooltip<number, string>
              content={tooltipData => renderTooltip(tooltipData, label)}
              offset={5}
              cursor={{ stroke: colors.gray['300'], strokeWidth: 2 }}
            />
          )}
        </LineChartRecharts>
      </ResponsiveContainer>
    </Box>
  )
}

export default LineChart
