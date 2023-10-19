import { $Values } from 'utility-types'
import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import Checkbox from '~/components/Ui/Form/Input/Checkbox/Checkbox'
import Radio from '~/components/Ui/Form/Input/Radio/Radio'
import Input from '~/components/Ui/Form/Input/Input'
import { TYPE_FORM } from '~/constants/FormConstants'

type Props = {
  field: Record<string, any>
  checked: boolean
  onChange: (value: string) => void
  toggleChecked?: () => void
  disabled?: boolean
  value?: string
  typeForm?: $Values<typeof TYPE_FORM>
}

const Other = ({ disabled, field, onChange, value = '', checked, toggleChecked, typeForm }: Props) => (
  <div id={`reply-${field.id}_choice-other`} className="other-field">
    <div className="other-field__input">
      {field.type === 'checkbox' ? (
        <Checkbox
          id={`reply-${field.id}_choice-other--check`}
          name={`choices-for-field-${field.id}`}
          checked={checked}
          value="other"
          onChange={() => (toggleChecked ? toggleChecked() : onChange(''))}
          disabled={disabled}
          label={<FormattedMessage id="gender.other" />}
          typeForm={typeForm}
        />
      ) : (
        <Radio
          id={`reply-${field.id}_choice-other--check`}
          name={`choices-for-field-${field.id}`}
          value="other"
          checked={checked}
          onChange={() => (toggleChecked ? toggleChecked() : onChange(''))}
          disabled={disabled}
          label={<FormattedMessage id="gender.other" />}
          typeForm={typeForm}
        />
      )}
    </div>
    <div className="other-field__value">
      <Input
        type="text"
        name={`reply-${field.id}_choice-other--field`}
        id={`reply-${field.id}_choice-other--field`}
        onChange={(e: React.SyntheticEvent<HTMLInputElement>) => onChange(e.target.value)}
        value={value}
        disabled={disabled}
      />
    </div>
  </div>
)

export default Other
