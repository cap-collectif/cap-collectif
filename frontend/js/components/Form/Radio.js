// @flow
import React, { useState } from 'react';
import { HelpBlock } from 'react-bootstrap';
import Other from './Other';
import WYSIWYGRender from './WYSIWYGRender';
import ButtonBody from '../Reply/Form/ButtonBody';
import Input from './Input';
import type { Value, Fields } from './Form.type';

type Props = {
  id: string,
  field: Fields,
  value: Value,
  onChange: Function,
  disabled?: boolean,
  onBlur?: Function,
};

const MultipleRadio = ({ disabled = false, id, field, value = {}, onBlur, onChange }: Props) => {
  const [otherChecked, setOtherChecked] = useState<boolean>(value ? !!value.other : false);
  const finalValue: Array<string> = value ? value.labels : [];
  const otherValue = value ? value.other : null;

  const handleChange = (choiceValue: string) => {
    // value already in, no need update
    if (finalValue.includes(choiceValue)) return;

    const newValue = { labels: [choiceValue], other: null };
    setOtherChecked(false);
    onChange(newValue);
  };

  const onOtherChange = (inputOtherValue: string = '') => {
    const newValue = {
      labels: [],
      other: inputOtherValue,
    };

    onChange(newValue);
    setOtherChecked(true);
  };

  return (
    <div className="form-group form-fields" id={id}>
      {field.helpText && <HelpBlock>{field.helpText}</HelpBlock>}
      {field.description && <ButtonBody body={field.description} />}

      {field.choices &&
        field.choices.map(choice => {
          const choiceKey = `choice-${choice.id}`;
          const choiceValue: string = choice.useIdAsValue && choice.id ? choice.id : choice.label;

          return (
            <div key={choiceKey} className="choice-field mb-15">
              <Input
                type="radio"
                name={`choices-for-field-${field.id}`}
                id={`${id}_${choiceKey}`}
                value={choiceValue}
                radioChecked={finalValue.includes(choiceValue)}
                disabled={disabled}
                image={choice.image ? choice.image.url : null}
                onBlur={event => {
                  if (onBlur && event) onBlur(event.preventDefault());
                }}
                onChange={() => handleChange(choiceValue)}>
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
          checked={otherChecked}
          field={field}
          onChange={onOtherChange}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default MultipleRadio;
