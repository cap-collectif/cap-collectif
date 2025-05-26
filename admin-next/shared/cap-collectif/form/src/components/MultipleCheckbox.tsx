// @ts-nocheck

import type { FC, ChangeEvent } from 'react';
import { Checkbox as CapCheckbox, CheckboxGroup } from '@cap-collectif/ui';

export type MultipleCheckboxValue = {
    labels: string[],
};

type Choice = {
    id?: string | null,
    useIdAsValue: boolean,
    label: string,
};

export interface MultipleCheckboxProps {
    name: string;
    id: string;
    choices: Choice[];
    value?: MultipleCheckboxValue;
    onChange?: (value: MultipleCheckboxValue) => void;
}

export const MultipleCheckbox: FC<MultipleCheckboxProps> = ({
    choices,
    value,
    id,
    onChange,
    ...rest
}) => {
    const finalValue = value ? value.labels : [];
    const fieldName = `choices-for-field-${id}`;

    const handleChange = (event: ChangeEvent<HTMLInputElement>, choiceValue: string) => {
        const newValue = [...finalValue];

        if (event && event.target.checked) newValue.push(choiceValue);
        else newValue.splice(newValue.indexOf(choiceValue), 1);

        if (onChange) onChange({ labels: newValue });
    };

    return (
        <CheckboxGroup>
            {choices.map((choice, idx) => {
                const choiceKey = choice.id ? `choice-${choice.id}` : `choice-${idx}`;
                const choiceValue = choice.useIdAsValue && choice.id ? choice.id : choice.label;

                return (
                    <CapCheckbox
                        {...rest}
                        key={choiceKey}
                        name={fieldName}
                        id={`${id}_${choiceKey}`}
                        checked={finalValue?.includes(choiceValue)}
                        onChange={event => handleChange(event, choiceValue)}>
                        {choice.label}
                    </CapCheckbox>
                );
            })}
        </CheckboxGroup>
    );
};

export default MultipleCheckbox;
