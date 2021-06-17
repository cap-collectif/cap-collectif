// @flow
import * as React from 'react';
import LineChart, { type LineChartProps } from '~ui/Dashboard/LineChart';

export default {
  title: 'Cap Collectif/Dashboard/LineChart',
  component: LineChart,
  argTypes: {
    withGrid: {
      control: { type: 'boolean', required: false },
      description: 'Display grid',
    },
    withAxis: {
      control: { type: 'boolean', required: false },
      description: 'Display axis',
    },
    withTooltip: {
      control: { type: 'boolean', required: false },
      description: 'Display tooltip on graph',
    },
    label: {
      control: { type: 'text', required: true },
      description: 'Define the subject of chart',
    },
  },
};

const Template = (args: LineChartProps) => <LineChart {...args} />;

export const main = Template.bind({});
main.storyName = 'default';
main.args = {
  width: '600px',
  height: '600px',
  withGrid: true,
  withAxis: true,
  label: 'Votes',
  data: [
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
    {
      date: '17 sept',
      value: 3908,
    },
    {
      date: '22 sept',
      value: 4800,
    },
    {
      date: '26 sept',
      value: 3800,
    },
    {
      date: '29 sept',
      value: 9000,
    },
  ],
};
