// @flow
import React, { useState } from 'react';
import Other from '../Other/Other';
import Help from '~/components/Ui/Form/Help/Help';
import Description from '~/components/Ui/Form/Description/Description';
import WYSIWYGRender from '../WYSIWYGRender';
import Radio from '~/components/Ui/Form/Input/Radio/Radio';
import type { Fields, Value } from '~/components/Form/Form.type';
import { TYPE_FORM } from '~/constants/FormConstants';
import { ItemMultipleRadioContainer } from './MultipleRadio.style';

type Props = {|
  id: string,
  field: Fields,
  value: Value,
  onChange: Function,
  disabled?: boolean,
  onBlur?: Function,
  typeForm?: $Values<typeof TYPE_FORM>,
|};

const MultipleRadio = ({
  disabled = false,
  id,
  field,
  value = {},
  onBlur,
  onChange,
  typeForm,
}: Props) => {
  const [otherChecked, setOtherChecked] = useState<boolean>(value ? !!value.other : false);
  const finalValue: Array<string> = value ? value.labels : [];
  const otherValue = value ? value.other : null;

  const handleChange = (event: SyntheticInputEvent<HTMLInputElement>, choiceValue: string) => {
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
      {field.helpText && (
        <Help className="help-block" typeForm={typeForm}>
          {field.helpText}
        </Help>
      )}
      {field.description && <Description typeForm={typeForm}>{field.description}</Description>}

      {field.choices &&
        field.choices.map(choice => {
          const choiceKey: string = `choice-${choice.id}`;
          const choiceValue: string = choice.useIdAsValue && choice.id ? choice.id : choice.label;

          return (
            <ItemMultipleRadioContainer
              key={choiceKey}
              hasImage={choice.image && !!choice.image.url}>
              <Radio
                name={`choices-for-field-${field.id}`}
                id={`${id}_${choiceKey}`}
                value={choiceValue}
                label={choice.label}
                checked={finalValue.includes(choiceValue)}
                image={choice.image ? choice.image.url : ''}
                typeForm={typeForm}
                disabled={disabled}
                onBlur={event => {
                  if (onBlur && event) onBlur(event.preventDefault());
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
            </ItemMultipleRadioContainer>
          );
        })}

      {field.isOtherAllowed && (
        <Other
          value={otherValue || ''}
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

export default MultipleRadio;
