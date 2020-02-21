// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Input from './Input';
import type { Fields } from './Form.type';

type Props = {
  field: Fields,
  checked: boolean,
  onChange: (value: string) => void,
  toggleChecked?: () => void,
  disabled?: boolean,
  value?: string,
};

const Other = ({ disabled, field, onChange, value = '', checked, toggleChecked }: Props) => (
  <div id={`reply-${field.id}_choice-other`} className="other-field">
    <div className="other-field__input">
      <Input
        id={`reply-${field.id}_choice-other--check`}
        name={`choices-for-field-${field.id}`}
        type={field.type}
        radioChecked={checked}
        checked={checked}
        helpPrint={false}
        onChange={() => (toggleChecked ? toggleChecked() : onChange(''))}
        disabled={disabled}>
        <FormattedMessage id="gender.other" />
      </Input>
    </div>
    <div className="other-field__value">
      <Input
        className="reduced"
        id={`reply-${field.id}_choice-other--field`}
        type="text"
        onChange={e => onChange(e.target.value)}
        placeholder="reply.your_response"
        value={value}
        disabled={disabled}
      />
    </div>
  </div>
);

export default Other;
