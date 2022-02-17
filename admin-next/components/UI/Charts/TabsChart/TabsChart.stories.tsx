import { Meta, Story } from '@storybook/react';
import TabsChart, { TabsChartProps } from './TabsChart';

const meta: Meta = {
    title: 'Admin-next/Charts/TabsChart',
    component: TabsChart,
    parameters: {
        controls: { expanded: true },
    },
};

const data = [
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
];

export default meta;

export const Default: Story<TabsChartProps> = () => (
    <TabsChart>
        <TabsChart.Tab id="vote" label="Vote" count={200} data={data} />
        <TabsChart.Tab id="comment" label="Commentaire" count={200} data={data} />
        <TabsChart.Tab id="contribution" label="Contribution" count={200} data={data} />
        <TabsChart.Tab id="follower" label="Abonnement" count={200} data={data} />
    </TabsChart>
);
