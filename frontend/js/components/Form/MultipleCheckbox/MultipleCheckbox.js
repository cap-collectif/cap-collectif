// @flow
import React, { useState, useEffect } from 'react';
import Other from '../Other/Other';
import Help from '~/components/Ui/Form/Help/Help';
import Description from '~/components/Ui/Form/Description/Description';
import WYSIWYGRender from '../WYSIWYGRender';
import Checkbox from '~/components/Ui/Form/Input/Checkbox/Checkbox';
import type { Value, Fields } from '../Form.type';
import { TYPE_FORM } from '~/constants/FormConstants';
import { ItemMultipleCheckboxContainer } from './MultipleCheckbox.style';

type Props = {|
  id: string,
  field: Fields,
  value: Value,
  onChange: Function,
  disabled?: boolean,
  onBlur?: Function,
  typeForm?: $Values<typeof TYPE_FORM>,
|};

const MultipleCheckbox = ({
  disabled = false,
  id,
  field,
  value = {},
  onBlur,
  onChange,
  typeForm,
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
    <div className="form-group form-fields" id={id}>
      {field.helpText && (
        <Help className="help-block" typeForm={typeForm}>
          {field.helpText}
        </Help>
      )}
      {field.description && <Description typeForm={typeForm}>{field.description}</Description>}

      {field.choices &&
        field.choices.map(choice => {
          const choiceKey = `choice-${choice.id}`;
          const choiceValue = choice.useIdAsValue && choice.id ? choice.id : choice.label;

          return (
            <ItemMultipleCheckboxContainer
              key={choiceKey}
              hasImage={choice.image && !!choice.image.url}>
              <Checkbox
                name={fieldName}
                id={`${id}_${choiceKey}`}
                value={choiceValue}
                label={choice.label}
                checked={finalValue.includes(choiceValue)}
                image={choice.image ? choice.image.url : ''}
                typeForm={typeForm}
                disabled={disabled}
                onBlur={event => {
                  if (onBlur) onBlur(event.preventDefault());
                }}
                onChange={event => handleChange(event, choiceValue)}
              />

              {choice.description && (
                <WYSIWYGRender
                  className="mb-20 pl-20 choice-description"
                  value={choice.description}
                  tagName="i"
                />
              )}
            </ItemMultipleCheckboxContainer>
          );
        })}

      {field.isOtherAllowed && (
        <Other
          value={otherValue || ''}
          toggleChecked={() => setOtherChecked(!otherChecked)}
          checked={otherChecked}
          field={field}
          onChange={onOtherChange}
          disabled={disabled}
          typeForm={typeForm}
        />
      )}
    </div>
  );
};

export default MultipleCheckbox;
