// @flow
import * as React from 'react';
import SmallChart, { type SmallChartProps } from '~ui/Dashboard/SmallChart';

export default {
  title: 'Cap Collectif/Dashboard/SmallChart',
  component: SmallChart,
  argTypes: {
    withGrid: {
      control: { type: 'boolean', required: false },
      description: 'Display grid',
    },
    withAxis: {
      control: { type: 'boolean', required: false },
      description: 'Display axis',
    },
    label: {
      control: { type: 'text', required: true },
      description: 'Define the subject of chart',
    },
    count: {
      control: { type: 'number', required: true },
    },
  },
};

const Template = (args: SmallChartProps) => <SmallChart {...args} />;

export const main = Template.bind({});
main.storyName = 'default';
main.args = {
  width: '110px',
  height: '65px',
  label: 'Votes',
  count: 123,
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
