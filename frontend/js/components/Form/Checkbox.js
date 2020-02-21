// @flow
import React, { useState, useEffect } from 'react';
import Input from './Input';
import Other from './Other';
import ButtonBody from '../Reply/Form/ButtonBody';
import WYSIWYGRender from './WYSIWYGRender';
import type { Value, Fields } from './Form.type';

type Props = {
  id: string,
  field: Fields,
  value?: Value,
  onChange: Function,
  disabled?: boolean,
  onBlur?: Function,
  getGroupStyle: Function,
};

const Checkbox = ({
  disabled = false,
  id,
  field,
  value = {},
  onBlur,
  onChange,
  getGroupStyle,
}: Props) => {
  const [otherChecked, setOtherChecked] = useState<boolean>(value ? !!value.other : false);
  const finalValue = value ? value.labels : [];
  const otherValue = value ? value.other : null;
  const fieldName = `choices-for-field-${field.id}`;

  useEffect(() => {
    // reset field other
    if (otherChecked === false) {
      onChange({ labels: finalValue, other: null });
    }
  }, [otherChecked, finalValue, onChange]);

  const handleChange = (event: SyntheticInputEvent<HTMLInputElement>, choiceValue: string) => {
    const newValue = [...finalValue];

    if (event && event.target.checked) {
      newValue.push(choiceValue);
    } else {
      newValue.splice(newValue.indexOf(choiceValue), 1);
    }

    onChange({ labels: newValue, other: otherValue });
  };

  const onToggleOther = () => {
    setOtherChecked(!otherChecked);
  };

  const onOtherChange = (inputOtherValue: string = '') => {
    const values = value.labels || [];
    const newValue = {
      labels: values,
      other: inputOtherValue,
    };

    onChange(newValue);
    setOtherChecked(true);
  };

  return (
    <div className={`form-group ${getGroupStyle(field.id)} form-fields`} id={id}>
      {field.helpText && <span className="help-block">{field.helpText}</span>}
      {field.description && <ButtonBody body={field.description || ''} />}

      {field.choices &&
        field.choices.map(choice => {
          const choiceKey = `choice-${choice.id}`;
          const choiceValue = choice.useIdAsValue && choice.id ? choice.id : choice.label;

          return (
            <div key={choiceKey} className="choice-field">
              <Input
                id={`${id}_${choiceKey}`}
                name={fieldName}
                type="checkbox"
                helpPrint={false}
                value={choiceValue}
                checked={finalValue.indexOf(choiceValue) !== -1}
                disabled={disabled}
                onBlur={event => {
                  if (onBlur) onBlur(event.preventDefault());
                }}
                onChange={event => handleChange(event, choiceValue)}
                image={choice.image ? choice.image.url : null}>
                {choice.label}
              </Input>
              {choice.description && (
                <WYSIWYGRender
                  className="mb-20 pl-20 choice-description"
                  value={choice.description}
                  tagName="i"
                />
              )}
            </div>
          );
        })}
      {field.isOtherAllowed && (
        <Other
          value={otherValue || ''}
          toggleChecked={onToggleOther}
          checked={otherChecked}
          field={field}
          onChange={onOtherChange}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default Checkbox;
