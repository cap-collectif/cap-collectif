// @flow
import * as React from 'react';
import TrafficChart, { type TrafficChartProps } from '~ui/Dashboard/TrafficChart';

export default {
  title: 'Cap Collectif/Dashboard/TrafficChart',
  component: TrafficChart,
  argTypes: {
    percentages: {
      control: { type: null, required: true },
    },
  },
};

const Template = (args: TrafficChartProps) => <TrafficChart {...args} />;

export const main = Template.bind({});
main.storyName = 'default';
main.args = {
  percentages: [
    {
      id: 'search-engine',
      percentage: 20,
    },
    {
      id: 'direct',
      percentage: 40,
    },
    {
      id: 'extern-link',
      percentage: 10,
    },
    {
      id: 'social-network',
      percentage: 10,
    },
    {
      id: 'mail',
      percentage: 20,
    },
  ],
};
