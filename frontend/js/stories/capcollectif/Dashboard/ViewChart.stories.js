// @flow
import * as React from 'react';
import ViewChart, { type ViewChartProps } from '~ui/Dashboard/ViewChart';

export default {
  title: 'Cap Collectif/Dashboard/ViewChart',
  component: ViewChart,
  argTypes: {
    label: {
      control: {
        type: 'text',
        required: true,
      },
    },
    total: {
      control: {
        type: 'number',
        required: true,
      },
      description: 'Total of view',
    },
    count: {
      control: {
        type: 'number',
        required: true,
      },
      description: 'Count of view',
    },
    level: {
      control: {
        type: 'number',
        required: true,
      },
      description: 'Allow to determine color of chart',
    },
  },
};

const Template = (args: ViewChartProps) => <ViewChart {...args} />;

export const main = Template.bind({});
main.storyName = 'default';
main.args = {
  label:
    'https://jesuisvraimentuntrestresgrandlabeldoncjeseraicoupeemaislajesuispasencorelongdoncjecontinue',
  total: 400000,
  count: 250000,
  level: 0,
};
