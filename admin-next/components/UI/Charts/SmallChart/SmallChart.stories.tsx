import { Meta, Story } from '@storybook/react';
import SmallChart, { SmallChartProps } from './SmallChart';
import { Box } from '@cap-collectif/ui';

const meta: Meta = {
    title: 'Admin-next/Charts/SmallChart',
    component: SmallChart,
    args: {
        label: 'Fruits',
        count: 2123,
        data: [
            {
                date: '11/03/2022',
                value: 200,
            },
            {
                date: '16/03/2022',
                value: 123,
            },
            {
                date: '18/03/2022',
                value: 800,
            },
            {
                date: '22/03/2022',
                value: 500,
            },
            {
                date: '26/03/2022',
                value: 500,
            },
        ],
    },
    parameters: {
        controls: { expanded: true },
    },
};

export default meta;

export const Default: Story<SmallChartProps> = args => (
    <Box width="400px" height="200px">
        <SmallChart {...args} />
    </Box>
);
