// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { PieChart as PieChartRecharts, Pie, Cell, ResponsiveContainer } from 'recharts';
import Flex, { type FlexProps } from '~ui/Primitives/Layout/Flex';
import Label from '../Label';
import AppBox from '~ui/Primitives/AppBox';
import colors from '~/styles/modules/colors';

type Percentage = {|
  +id: string,
  +label: string,
  +value: string,
|};

type PercentageFormatted = {|
  ...Percentage,
  +value: number,
  +color: string,
|};

export type PieChartProps = {|
  ...FlexProps,
  percentages: Percentage[],
|};

const percentageColors: string[] = [
  colors.blue['800'],
  colors.blue['500'],
  colors.green['500'],
  colors.orange['500'],
];

const PieChart = ({ percentages, ...props }: PieChartProps) => {
  const [hovered, setHovered] = React.useState<?string>(null);
  const intl = useIntl();

  const displayPercentages: PercentageFormatted[] = percentages
    .slice(0, percentageColors.length)
    .map((p, idx) => ({ ...p, color: percentageColors[idx], value: parseInt(p.value,10) }));
  const otherPercentages: PercentageFormatted = percentages.slice(percentageColors.length, percentages.length).reduce(
    (acc, percentage) => ({
      id: 'other',
      label: 'global.plural.other',
      color: colors.red['500'],
      value: acc.value ? parseInt(acc.value, 10) + parseInt(percentage.value, 10) : parseInt(percentage.value, 10),
    }),
    { id: 'other', label: 'global.plural.other', color: colors.red['500'], value: 0 },
  );

  const percentagesFormatted = React.useMemo(
    () =>
      [...displayPercentages, otherPercentages]
        .filter(p => p.value)
        .sort((p1, p2) => (p1.value > p2.value ? -1 : 1)),
    [displayPercentages, otherPercentages],
  );

  return (
    <Flex direction="row" justify="space-between" {...props}>
      <Flex direction="column" spacing={3} flex={1}>
        {percentagesFormatted.map(percentage => (
          <Label
            key={`label-${percentage.id}`}
            circleColor={percentage.color}
            state={hovered === null || hovered === percentage.id ? 'idle' : 'hidden'}
            onMouseOver={() => setHovered(percentage.id)}
            onMouseOut={() => setHovered(null)}>
            {`${intl.formatMessage({ id: percentage.label })} (${percentage.value}%)`}
          </Label>
        ))}
      </Flex>

      <AppBox flex={1}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChartRecharts width="100%" height="100%">
            <Pie dataKey="value" data={percentagesFormatted} cx="50%" cy="50%" outerRadius="100%">
              {percentagesFormatted.map(percentage => (
                <Cell
                  key={`cell-${percentage.id}`}
                  fill={percentage.color}
                  onMouseOver={() => setHovered(percentage.id)}
                  onMouseOut={() => setHovered(null)}
                  opacity={hovered === null || hovered === percentage.id ? 1 : 0.2}
                />
              ))}
            </Pie>
          </PieChartRecharts>
        </ResponsiveContainer>
      </AppBox>
    </Flex>
  );
};

export default PieChart;
