import * as React from 'react'
import type { SegmentedControlValue } from '@ui/SegmentedControl/item/SegmentedControlItem'

export type SegmentedControlContextType = {
  onChange: (value: SegmentedControlValue) => void
  value: SegmentedControlValue
}

export const SegmentedControlContext = React.createContext<SegmentedControlContextType>({
  onChange: () => {},
  value: '',
})

export const useSegmentedControl = (): SegmentedControlContextType => {
  const context = React.useContext(SegmentedControlContext)
  if (!context) {
    throw new Error(`You can't use the SegmentedControlContext outside an SegmentedControl component.`)
  }
  return context
}
