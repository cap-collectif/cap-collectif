// @flow
import * as React from 'react';
import TabsChart, { type TabsChartProps } from '~ui/Dashboard/TabsChart';

export default {
  title: 'Cap Collectif/Dashboard/TabsChart',
  component: TabsChart,
  argTypes: {},
};

const Template = (args: TabsChartProps) => (
  <TabsChart {...args}>
    <TabsChart.Tab
      data={[
        {
          date: '7 sept',
          value: 2400,
        },
        {
          date: '9 sept',
          value: 1398,
        },
        {
          date: '13 sept',
          value: 9800,
        },
      ]}
      id="vote"
      label="votes"
      count={13598}
    />
    <TabsChart.Tab
      data={[
        {
          date: '7 nov',
          value: 10000,
        },
        {
          date: '9 nov',
          value: 15000,
        },
        {
          date: '13 nov',
          value: 20000,
        },
      ]}
      id="contribution"
      label="contributions"
      count={45000}
    />
    <TabsChart.Tab
      data={[
        {
          date: '7 dec',
          value: 1234,
        },
        {
          date: '9 dec',
          value: 4567,
        },
        {
          date: '13 dec',
          value: 8912,
        },
      ]}
      id="commentaire"
      label="commentaires"
      count={14713}
    />
  </TabsChart>
);

export const main = Template.bind({});
main.storyName = 'default';
main.args = {};
