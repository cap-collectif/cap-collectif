import { Meta, Story } from '@storybook/react';
import ViewChart, { ViewChartProps } from './ViewChart';
import { Box } from '@cap-collectif/ui';

const meta: Meta = {
    title: 'Admin-next/Charts/ViewChart',
    component: ViewChart,
    args: {
        total: 166,
        count: 33,
        level: 1,
        label: 'Fruits',
    },
    parameters: {
        controls: { expanded: true },
    },
};

export default meta;

export const Default: Story<ViewChartProps> = args => (
    <Box width="400px">
        <ViewChart {...args} />
    </Box>
);
