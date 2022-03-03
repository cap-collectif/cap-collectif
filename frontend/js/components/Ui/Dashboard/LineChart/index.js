// @flow
import * as React from 'react';
import {
  LineChart as LineChartRecharts,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import Text from '~ui/Primitives/Text';
import colors from '~/styles/modules/colors';
import { formatBigNumber } from '~/utils/bigNumberFormatter';

type Data = {|
  +date: string,
  +value: number,
|};

export type LineChartProps = {|
  ...AppBoxProps,
  +withGrid?: boolean,
  +withAxis?: boolean,
  +withTooltip?: boolean,
  +data: Data[],
  +label: React.Node,
|};

const renderTooltip = ({ payload }, label: React.Node) =>
  payload && payload[0] ? (
    <AppBox bg="blue.800" borderRadius="normal" p={1}>
      <Text color="blue.200">{payload[0].payload.date}</Text>
      <Text color="white">
        {formatBigNumber(payload[0].value)} {label}
      </Text>
    </AppBox>
  ) : null;

const LineChart = ({
  data,
  label,
  withGrid = false,
  withAxis = false,
  withTooltip = true,
  ...props
}: LineChartProps) => {
  return (
    <AppBox width="100%" height="100%" {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChartRecharts width={500} height={500} data={data}>
          <defs>
            <linearGradient id="colorLine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.blue['700']} />
              <stop offset="100%" stopColor={colors.blue['300']} />
            </linearGradient>
          </defs>

          {withAxis && <XAxis dataKey="date" />}
          {withAxis && <YAxis />}
          {withGrid && <CartesianGrid strokeDasharray="3 3" />}

          {data.length === 1 && (
            <ReferenceLine y={data[0].value} stroke={colors.blue['700']} strokeWidth={2} />
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke="url(#colorLine)"
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />

          {withTooltip && (
            <Tooltip
              content={tooltipData => renderTooltip(tooltipData, label)}
              offset={5}
              cursor={{ stroke: colors.gray['300'], strokeWidth: 2 }}
            />
          )}
        </LineChartRecharts>
      </ResponsiveContainer>
    </AppBox>
  );
};

export default LineChart;
