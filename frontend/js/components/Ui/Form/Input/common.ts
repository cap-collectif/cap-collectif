import type { Node } from 'react'
import 'react'

export type CommonPropsInput = {
  id: string
  name: string
  value?: string | number
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  placeholder?: string
  label?: Node
  className?: string
  maxlength?: number
  minlength?: number
  onChange?: (...args: Array<any>) => any
  onBlur?: (...args: Array<any>) => any
  onFocus?: (...args: Array<any>) => any
}
export type NativeInput = {
  name: string
  onBlur: () => void
  onChange: () => void
  onDragStart: () => void
  onDrop: () => void
  onFocus: () => void
  value: (string | null | undefined) | (number | null | undefined) | (boolean | null | undefined)
  checked?: boolean | null | undefined
}
