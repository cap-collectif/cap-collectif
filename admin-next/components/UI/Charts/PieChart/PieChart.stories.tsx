import { Meta, Story } from '@storybook/react';
import PieChart, { PieChartProps } from './PieChart';
import { Box } from '@cap-collectif/ui';

const meta: Meta = {
    title: 'Admin-next/Charts/PieChart',
    component: PieChart,
    args: {
        percentages: [
            {
                id: '1',
                label: 'Pomme',
                value: 123,
            },
            {
                id: '2',
                label: 'Cerise',
                value: 143,
            },
            {
                id: '3',
                label: 'Poire',
                value: 150,
            },
            {
                id: '4',
                label: 'Banane',
                value: 300,
            },
        ],
    },
    parameters: {
        controls: { expanded: true },
    },
};

export default meta;

export const Default: Story<PieChartProps> = args => (
    <Box width="300px" height="300px">
        <PieChart {...args} />
    </Box>
);
