import { useState, useMemo, FC } from 'react';
import { PieChart as PieChartRecharts, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useIntl } from 'react-intl';
import { Flex, FlexProps, Box, useTheme } from '@cap-collectif/ui';
import Label from '../Label/Label';

type Percentage = {
    readonly id: string;
    readonly label: string;
    readonly value: number;
};

type PercentageFormatted = Percentage & {
    color: string;
};

export interface PieChartProps extends FlexProps {
    percentages: Percentage[];
}

const PieChart: FC<PieChartProps> = ({ percentages, ...props }) => {
    const intl = useIntl();
    const { colors } = useTheme();
    const [hovered, setHovered] = useState<string | null>(null);

    const percentageColors: string[] = [
        colors.blue['800'],
        colors.blue['500'],
        colors.green['500'],
        colors.orange['500'],
    ];

    const percentagesSorted = percentages.sort((p1, p2) => (p1.value > p2.value ? -1 : 1));

    const displayPercentages: PercentageFormatted[] = percentagesSorted
        .slice(0, percentageColors.length)
        .map((p, idx) => ({ ...p, color: percentageColors[idx] }));

    const otherPercentages: PercentageFormatted = percentagesSorted
        .slice(percentageColors.length, percentages.length)
        .reduce(
            (acc: PercentageFormatted, percentage) => ({
                id: 'other',
                label: 'global.plural.other',
                color: colors.red['500'],
                value: acc.value ? acc.value + percentage.value : percentage.value,
            }),
            { id: 'other', label: 'global.plural.other', color: colors.red['500'], value: 0 },
        );

    const percentagesFormatted = useMemo(
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

            <Box flex={1}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChartRecharts>
                        <Pie
                            dataKey="value"
                            data={percentagesFormatted}
                            cx="50%"
                            cy="50%"
                            outerRadius="100%">
                            {percentagesFormatted.map(percentage => (
                                <Cell
                                    key={`cell-${percentage.id}`}
                                    fill={percentage.color}
                                    onMouseOver={() => setHovered(percentage.id)}
                                    onMouseOut={() => setHovered(null)}
                                    opacity={
                                        hovered === null || hovered === percentage.id ? 1 : 0.2
                                    }
                                />
                            ))}
                        </Pie>
                    </PieChartRecharts>
                </ResponsiveContainer>
            </Box>
        </Flex>
    );
};

export default PieChart;
