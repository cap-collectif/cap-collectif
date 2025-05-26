import type {
  CheckboxProps,
  RadioProps,
  TextAreaProps,
  InputProps,
  SwitchProps,
  InputNumberProps,
  CodeInputProps,
  DateInputProps,
  ColorPickerProps,
} from '@cap-collectif/ui'
import type { SyntheticEvent } from 'react'
import type {
  Control,
  RegisterOptions,
  UseControllerProps,
} from 'react-hook-form'

import type { MultipleCheckboxProps } from '../MultipleCheckbox'
import type { MultipleRadioProps } from '../MultipleRadio'
import type { SelectProps } from '../Select'
import { AddressProps } from '../address'
import type { FlagSelectProps } from '../flagSelect'
import type { UploaderProps } from '../uploader'

type Rules = {
  validate?: RegisterOptions['validate']
  pattern?: RegisterOptions['pattern']
  setValueAs?: RegisterOptions['setValueAs']
  required?: RegisterOptions['required']
  min?: RegisterOptions['min']
  max?: RegisterOptions['max']
  minLength?: RegisterOptions['minLength']
  maxLength?: RegisterOptions['maxLength']
}

export type BaseField = {
  name: UseControllerProps['name']
  control: Control<any>
  onChange?: (event: SyntheticEvent) => void
  defaultValue?: any
  rules?: Rules
  id?: string
}

export type AllFieldTypes =
  | FieldSelect
  | FieldCheckbox
  | FieldRadio
  | FieldTextArea
  | FieldText
  | FieldSwitch
  | FieldUploader
  | FieldNumber
  | FieldCodeInput
  | FieldFlagSelect
  | FieldDate
  | FieldHour
  | FieldDateHour
  | FieldAddress
  | FieldColorPicker

export type FieldSelect = SelectProps & {
  type: 'select'
}

export type FieldCheckbox = (CheckboxProps | MultipleCheckboxProps) & {
  type: 'checkbox'
}

export type FieldRadio = (RadioProps | MultipleRadioProps) & {
  type: 'radio'
}

export type FieldTextArea = {
  type: 'textarea'
} & TextAreaProps

export type FieldText = {
  type: 'text' | 'email' | 'password' | 'tel' | 'hidden'
} & InputProps

export type FieldSwitch = {
  type: 'switch'
} & SwitchProps

export type FieldUploader = {
  type: 'uploader'
} & UploaderProps

export type FieldNumber = {
  type: 'number'
} & InputNumberProps

export type FieldCodeInput = {
  type: 'codeInput'
} & Omit<CodeInputProps, 'onComplete'>

export type FieldFlagSelect = {
  type: 'flagSelect'
} & FlagSelectProps

export type FieldDate = Omit<DateInputProps, 'value' | 'onChange'> & {
  type: 'date'
}

export type FieldHour = Omit<DateInputProps, 'value' | 'onChange'> & {
  type: 'hour'
}

export type FieldDateHour = Omit<DateInputProps, 'value' | 'onChange'> & {
  type: 'dateHour'
}

export type FieldAddress = AddressProps & {
  type: 'address'
}

export type FieldColorPicker = Omit<ColorPickerProps, 'value' | 'onChange'> & {
  type: 'colorPicker'
}
