import React from 'react'
import type { Fields, Value } from '~/components/Form/Form.type'
import type { MajorityProperty } from '~ui/Form/Input/Majority/Majority'
import Majority, { COLORS as COLORS_MAJORITY } from '~ui/Form/Input/Majority/Majority'
import { ChoicesContainer } from './MultipleMajority.style'
type Props = {
  field?: Fields
  value?: Value
  disableColors?: boolean
  enableBars?: boolean
  choices?: MajorityProperty[]
  disabled?: boolean
  onChange?: (...args: Array<any>) => any
  onBlur?: (...args: Array<any>) => any
  asPreview?: boolean
}

const MultipleMajority = ({
  field = {},
  value,
  onChange,
  onBlur,
  choices = [],
  enableBars = false,
  disableColors = false,
  disabled = false,
  asPreview = false,
}: Props) => {
  const choicesMajority =
    choices && choices.length > 0 ? choices : (Object.values(COLORS_MAJORITY) as any as MajorityProperty[])
  return (
    <div id={field.id} className="form-group" role="radiogroup" aria-labelledby={`label-${field.id}`}>
      <ChoicesContainer disabled={disabled} asPreview={asPreview} enableBars={enableBars} disableColors={disableColors}>
        {choicesMajority.map((majority, idx) => (
          <Majority
            key={idx}
            disableColors={disableColors}
            id={`choice-${field.id}-${majority.id}`}
            name={`choices-for-field-${field.id}`}
            color={majority.color}
            label={majority.label}
            value={majority.value}
            checked={value === majority.value}
            hasMajoritySelected={!!value}
            disabled={disabled}
            asPreview={asPreview}
            onChange={onChange}
            onBlur={event => {
              if (onBlur && event) onBlur(event.preventDefault())
            }}
          />
        ))}
      </ChoicesContainer>
    </div>
  )
}

export default MultipleMajority
