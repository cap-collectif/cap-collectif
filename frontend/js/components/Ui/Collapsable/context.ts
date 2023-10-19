import * as React from 'react'
export type Context = {
  readonly visible: boolean
  readonly setVisible: (value: boolean | ((updaterValue: boolean) => boolean)) => void
  readonly onClose?: () => void | Promise<any>
  readonly disabled?: boolean
}
export const CollapsableContext = React.createContext<Context>({
  visible: false,
  setVisible: () => undefined,
  onClose: () => undefined,
  disabled: false,
})
