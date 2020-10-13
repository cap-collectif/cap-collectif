// @flow
import React from 'react';
import type { Fields, Value } from '~/components/Form/Form.type';
import Majority, {
  COLORS as COLORS_MAJORITY,
  type MajorityProperty,
} from '~ui/Form/Input/Majority/Majority';
import { ChoicesContainer } from './MultipleMajority.style';

type Props = {|
  field?: Fields,
  value?: Value,
  disabled?: boolean,
  onChange?: Function,
  onBlur?: Function,
  asPreview?: boolean,
|};

const MultipleMajority = ({
  field = {},
  value,
  onChange,
  onBlur,
  disabled = false,
  asPreview = false,
}: Props) => {
  const choicesMajority = ((Object.values(COLORS_MAJORITY): any): MajorityProperty[]);

  return (
    <div id={field.id} className="form-group">
      <ChoicesContainer disabled={disabled} asPreview={asPreview}>
        {choicesMajority.map((majority, idx) => (
          <Majority
            key={idx}
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
              if (onBlur && event) onBlur(event.preventDefault());
            }}
          />
        ))}
      </ChoicesContainer>
    </div>
  );
};

export default MultipleMajority;
