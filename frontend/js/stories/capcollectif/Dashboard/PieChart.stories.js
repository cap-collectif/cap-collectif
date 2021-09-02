// @flow
import * as React from 'react';
import PieChart, { type PieChartProps } from '~ui/Dashboard/PieChart';

export default {
  title: 'Cap Collectif/Dashboard/PieChart',
  component: PieChart,
  argTypes: {
    percentages: {
      control: { type: null, required: true },
    },
  },
};

const Template = (args: PieChartProps) => <PieChart {...args} />;

export const main = Template.bind({});
main.storyName = 'default';
main.args = {
  percentages: [
    {
      id: 'search-engine',
      label: 'environment',
      value: '20',
    },
    {
      id: 'direct',
      label: 'project.types.quizz',
      value: '30',
    },
    {
      id: 'extern-link',
      label: 'type-theme',
      value: '15',
    },
    {
      id: 'social-network',
      label: 'project.types.inquiry',
      value: '15',
    },
    {
      id: 'mail',
      label: 'project.types.concertation',
      value: '12',
    },
    {
      id: 'other-one',
      label: 'project.types.mutualHelp',
      value: '3',
    },
    {
      id: 'jesaispas',
      label: 'project.types.participatoryFunding',
      value: '5',
    },
  ],
};
