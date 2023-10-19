import * as React from 'react'
export type DropdownValueAddedRemovedType = {
  added: ReadonlyArray<string>
  removed: ReadonlyArray<string>
  values: ReadonlyArray<string>
  all: ReadonlyArray<string>
}
export type DropdownValueType = string | ReadonlyArray<string> | DropdownValueAddedRemovedType | null
export type DropdownOnChangeType = (
  value: any,
) => void | ((value: DropdownValueAddedRemovedType) => void) | Promise<any>
export type DropdownMode = 'normal' | 'add-remove'
export type Context = {
  readonly mode: DropdownMode
  readonly isMultiSelect: boolean
  readonly allValues?: ReadonlyArray<string>
  readonly value?: DropdownValueType
  readonly initialValue?: DropdownValueType
  readonly setInitialValue: (value: ReadonlyArray<string> | null | undefined) => void
  readonly onChange?: DropdownOnChangeType
  readonly disabled?: boolean
  readonly defaultValue?: string
}
export const DropdownSelectContext = React.createContext<Context>({
  mode: 'normal',
  value: null,
  allValues: [],
  setInitialValue: () => {},
  initialValue: null,
  isMultiSelect: false,
})
