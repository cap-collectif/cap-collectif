import * as React from 'react';
import { Checkbox as CapCheckbox, CheckboxGroup } from '@cap-collectif/ui';

type Value = {
    labels: Array<string>,
    other?: string | null,
};

type Choice = {
    id?: string | null,
    useIdAsValue: boolean,
    label: React.ReactNode,
};

export interface MultipleCheckboxProps {
    name: string;
    id: string;
    choices?: Choice[];
    value?: Value;
    onChange?: (value: Value) => void;
}

export const MultipleCheckbox: React.FC<MultipleCheckboxProps> = ({
    choices,
    value,
    id,
    onChange,
    ...rest
}) => {
    const finalValue = value ? value.labels : [];
    const fieldName = `choices-for-field-${id}`;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, choiceValue: string) => {
        const newValue = [...finalValue];

        if (event && event.target.checked) newValue.push(choiceValue);
        else newValue.splice(newValue.indexOf(choiceValue), 1);

        if (onChange) onChange({ labels: newValue });
    };

    if (!choices) return null;

    return (
        <CheckboxGroup>
            {choices.map((choice, idx) => {
                const choiceKey = choice.id ? `choice-${choice.id}` : `choice-${idx}`;
                const choiceValue =
                    choice.useIdAsValue && choice.id ? choice.id : String(choice.label);

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
