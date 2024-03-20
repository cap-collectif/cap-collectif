import { Meta, Story } from '@storybook/react'
import LineChart, { LineChartProps } from './LineChart'
import { Box } from '@cap-collectif/ui'

const meta: Meta = {
  title: 'Admin-next/Charts/LineChart',
  component: LineChart,
  args: {
    label: 'Fruits',
    data: [
      {
        date: '11/02/2022',
        value: 123,
      },
      {
        date: '16/02/2022',
        value: 567,
      },
      {
        date: '18/02/2022',
        value: 980,
      },
      {
        date: '22/02/2022',
        value: 100,
      },
      {
        date: '26/02/2022',
        value: 250,
      },
    ],
  },
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

export const Default: Story<LineChartProps> = args => (
  <Box width="300px" height="300px">
    <LineChart {...args} />
  </Box>
)
