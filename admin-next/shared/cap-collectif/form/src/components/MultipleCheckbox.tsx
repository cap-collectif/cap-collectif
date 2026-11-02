// @ts-nocheck

import type { FC, ChangeEvent } from 'react'
import { CapUIFontSize, Checkbox as CapCheckbox, CheckboxGroup, Flex, Text } from '@cap-collectif/ui'

export type MultipleCheckboxValue = {
  labels: string[]
}

type Choice = {
  id?: string | null
  useIdAsValue: boolean
  label: string
  description?: string
}

export interface MultipleCheckboxProps {
  name: string
  id: string
  choices: Choice[]
  value?: MultipleCheckboxValue
  onChange?: (value: MultipleCheckboxValue) => void
}

export const MultipleCheckbox: FC<MultipleCheckboxProps> = ({ choices, value, id, onChange, ...rest }) => {
  const finalValue = value ? value.labels : []
  const fieldName = `choices-for-field-${id}`

  const handleChange = (event: ChangeEvent<HTMLInputElement>, choiceValue: string) => {
    const newValue = [...finalValue]

    if (event && event.target.checked) newValue.push(choiceValue)
    else newValue.splice(newValue.indexOf(choiceValue), 1)

    if (onChange) onChange({ labels: newValue })
  }

  return (
    <CheckboxGroup>
      {choices.map((choice, idx) => {
        const choiceKey = choice.id ? `choice-${choice.id}` : `choice-${idx}`
        const choiceValue = choice.useIdAsValue && choice.id ? choice.id : choice.label
        const labelId = `${id}_${choiceKey}_label`
        const descriptionId = `${id}_${choiceKey}_description`

        return (
          <CapCheckbox
            {...rest}
            key={choiceKey}
            name={fieldName}
            id={`${id}_${choiceKey}`}
            aria-labelledby={choice.description ? labelId : rest['aria-labelledby']}
            aria-describedby={
              [rest['aria-describedby'], choice.description ? descriptionId : undefined].filter(Boolean).join(' ') ||
              undefined
            }
            checked={finalValue?.includes(choiceValue)}
            onChange={event => handleChange(event, choiceValue)}
          >
            {choice.description ? (
              <Flex as="span" direction="column">
                <Text as="span" id={labelId}>
                  {choice.label}
                </Text>
                <Text as="span" id={descriptionId} fontSize={CapUIFontSize.BodySmall} color="text.secondary">
                  {choice.description}
                </Text>
              </Flex>
            ) : (
              choice.label
            )}
          </CapCheckbox>
        )
      })}
    </CheckboxGroup>
  )
}

export default MultipleCheckbox
