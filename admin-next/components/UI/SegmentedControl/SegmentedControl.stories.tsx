import { useState } from 'react'
import { Meta, Story } from '@storybook/react'
import { SegmentedControl, SegmentedControlProps } from './'
import { SegmentedControlValue } from '@ui/SegmentedControl/item/SegmentedControlItem'

const meta: Meta = {
  title: 'Admin-next/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

export const Default: Story<SegmentedControlProps> = () => {
  const [value, setValue] = useState<SegmentedControlValue>(1000)

  return (
    <SegmentedControl value={value} onChange={setValue}>
      <SegmentedControl.Item value={0}>0</SegmentedControl.Item>
      <SegmentedControl.Item value={1000}>1 000</SegmentedControl.Item>
      <SegmentedControl.Item value={2000}>2 000</SegmentedControl.Item>
      <SegmentedControl.Item value={5000}>5 000</SegmentedControl.Item>
      <SegmentedControl.Item value={10000}>10 000</SegmentedControl.Item>
      <SegmentedControl.Item value={20000}>20 000</SegmentedControl.Item>
    </SegmentedControl>
  )
}
