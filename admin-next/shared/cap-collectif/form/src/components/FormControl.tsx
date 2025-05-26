// @ts-nocheck

import type { FC } from 'react'
import React, { useId } from 'react'
import { useIntl } from 'react-intl'
import { Control, useController, FormState } from 'react-hook-form'
import {
  CapInputSize,
  FormControl as CapFormControl,
  FormControlProps as CapFormControlProps,
  FormErrorMessage,
} from '@cap-collectif/ui'

export interface FormControlProps extends CapFormControlProps {
  name: string
  control: Control<any>
  children?: React.ReactNode
}

const getTouchedState = (touchedFields: FormState['touchedFields'], name: string): boolean => {
  const isNestedField = name.includes('.')
  if (!isNestedField) return touchedFields[name]

  const [firstPart, secondPart] = name.split('.')
  if (touchedFields[firstPart]) return touchedFields[firstPart][secondPart]

  return false
}

export const FormControl: FC<FormControlProps> = ({
  name,
  control,
  children,
  variantSize = CapInputSize.Sm,
  sx,
  isRequired,
  ...props
}) => {
  const intl = useIntl()
  const generatedId = useId()

  const {
    field,
    fieldState: { invalid, error },
    formState: { touchedFields },
  } = useController({
    name,
    control,
    rules: {
      required: isRequired ? intl.formatMessage({ id: 'fill-field' }) : undefined,
    },
  })

  const mode = control?._options?.mode

  const isInvalid = invalid && (mode === 'onChange' ? getTouchedState(touchedFields, name) : true)

  const errorFieldId = `${name}-error`

  const inputComponent = React.Children.toArray(children).find(child => child?.type?.displayName === 'FieldInput')
  const inputId = inputComponent?.props?.id

  const labelComponent = React.Children.toArray(children).find(child => child?.type?.displayName === 'FormLabel')
  const labelFor = labelComponent?.props?.htmlFor

  const shouldAssignGeneratedId = inputComponent && labelComponent && (!inputId || !labelFor || inputId !== labelFor)

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      if (child?.type?.displayName === 'FieldInput') {
        return React.cloneElement(child, {
          ref: field.ref,
          'aria-describedby': isInvalid ? errorFieldId : undefined,
          id: shouldAssignGeneratedId ? generatedId : child.props.id,
        })
      }
      if (child?.type?.displayName === 'FormLabel' && shouldAssignGeneratedId) {
        return React.cloneElement(child, {
          htmlFor: generatedId,
        })
      }
      return React.cloneElement(child)
    }
    return null
  })

  return (
    <CapFormControl
      variantSize={variantSize}
      mb={4}
      isInvalid={isInvalid}
      isRequired={isRequired}
      sx={{
        '&:last-child': {
          mb: 0,
        },
        ...sx,
      }}
      {...props}
    >
      {childrenWithProps}

      {isInvalid && error?.message && (
        <FormErrorMessage color="red.600" id={errorFieldId}>
          {error.message}
        </FormErrorMessage>
      )}
    </CapFormControl>
  )
}

export default FormControl
