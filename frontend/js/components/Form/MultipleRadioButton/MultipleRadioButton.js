// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import Help from '~/components/Ui/Form/Help/Help';
import Description from '~/components/Ui/Form/Description/Description';
import Radio from '~/components/Ui/Form/Input/Radio/Radio';
import { mediaQueryMobile } from '~/utils/sizes';
import type { Fields } from '~/components/Form/Form.type';
import { TYPE_FORM } from '~/constants/FormConstants';

type Props = {|
  id: string,
  field: Fields,
  value: string | null,
  onChange: Function,
  disabled?: boolean,
  onBlur?: Function,
  typeForm?: $Values<typeof TYPE_FORM>,
|};

const MultipleRadioButtonContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-wrap: wrap;

  .radio-container {
    margin: 0 15px 15px 0;

    &:last-child {
      margin-right: 0;
    }
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    flex-direction: column;
    text-align: center;

    .radio-container {
      margin: 0 0 15px 0;
      width: 100%;

      * {
        width: 100%;
      }
    }
  }
`;

const MultipleRadioButton = ({
  disabled = false,
  id,
  field,
  value,
  onBlur,
  onChange,
  typeForm,
}: Props) => {
  const finalValue: string | null = value || null;

  const handleChange = (event: SyntheticInputEvent<HTMLInputElement>, choiceValue: string) => {
    // value already in, no need update
    if (finalValue === choiceValue) return;

    onChange(choiceValue);
  };

  return (
    <div className="form-group form-fields" id={id}>
      {field.helpText && (
        <Help className="help-block" typeForm={typeForm}>
          {field.helpText}
        </Help>
      )}
      {field.description && <Description typeForm={typeForm}>{field.description}</Description>}

      <MultipleRadioButtonContainer>
        {field.choices &&
          field.choices.map(choice => {
            const choiceKey = `choice-${choice.id}`;
            const choiceValue: string = choice.useIdAsValue && choice.id ? choice.id : choice.label;

            return (
              <Radio
                key={choiceKey}
                className="choice-field"
                name={`choices-for-field-${field.id}`}
                id={`${id}_${choiceKey}`}
                value={choiceValue}
                label={choice.label}
                checked={finalValue === choiceValue}
                image={choice.image ? choice.image.url : ''}
                disabled={disabled}
                color={choice.color}
                onBlur={event => {
                  if (onBlur && event) onBlur(event.preventDefault());
                }}
                onChange={event => handleChange(event, choiceValue)}
                isButton
              />
            );
          })}
      </MultipleRadioButtonContainer>
    </div>
  );
};

export default MultipleRadioButton;
