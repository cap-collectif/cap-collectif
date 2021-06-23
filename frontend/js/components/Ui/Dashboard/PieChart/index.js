// @flow
import * as React from 'react';
import { PieChart as PieChartRecharts, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useIntl } from 'react-intl';
import Flex, { type FlexProps } from '~ui/Primitives/Layout/Flex';
import Label from '../Label';
import AppBox from '~ui/Primitives/AppBox';
import colors from '~/styles/modules/colors';

type Percentage = {|
  +id: string,
  +label: string,
  +value: number,
|};

type PercentageFormatted = {|
  ...Percentage,
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
  const intl = useIntl();
  const [hovered, setHovered] = React.useState<?string>(null);

  const percentagesSorted = percentages.sort((p1, p2) => (p1.value > p2.value ? -1 : 1));

  const displayPercentages: PercentageFormatted[] = percentagesSorted
    .slice(0, percentageColors.length)
    .map((p, idx) => ({ ...p, color: percentageColors[idx] }));
  const otherPercentages: PercentageFormatted = percentagesSorted
    .slice(percentageColors.length, percentages.length)
    .reduce(
      (acc, percentage) => ({
        id: 'other',
        label: 'global.plural.other',
        color: colors.red['500'],
        value: acc.value ? acc.value + percentage.value : percentage.value,
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
            onMouseOut={() => setHovered(null)}
            title={
              percentage.id === 'other'
                ? intl.formatMessage({ id: percentage.label })
                : percentage.label
            }>
            {`${
              percentage.id === 'other'
                ? intl.formatMessage({ id: percentage.label })
                : percentage.label.length > 40
                ? `${percentage.label.slice(0, 40)}...`
                : percentage.label
            } (${percentage.value}%)`}
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
