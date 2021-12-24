import * as React from 'react';
import { Checkbox as CapCheckbox, CheckboxGroup } from '@cap-collectif/ui';

type Value = {
    labels: Array<string>,
    other?: string | null,
};

export interface CheckboxProps {
    name: string;
    id: string;
    placeholder?: string;
    choices?: Array<{ id: string | null | undefined, useIdAsValue: boolean, label: string }>;
    value?: Value;
    onChange?: (value: Value) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ choices, value, id, onChange, ...rest }) => {
    const finalValue = value ? value.labels : [];
    const fieldName = `choices-for-field-${id}`;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, choiceValue: string) => {
        const newValue = [...finalValue];

        if (event && event.target.checked) {
            newValue.push(choiceValue);
        } else {
            newValue.splice(newValue.indexOf(choiceValue), 1);
        }
        if (onChange) onChange({ labels: newValue });
    };

    if (choices)
        return (
            <CheckboxGroup>
                {choices.map(choice => {
                    const choiceKey = `choice-${choice.id}`;
                    const choiceValue = choice.useIdAsValue && choice.id ? choice.id : choice.label;

                    return (
                        <CapCheckbox
                            {...rest}
                            key={choiceKey}
                            name={fieldName}
                            id={`${id}_${choiceKey}`}
                            label={choice.label}
                            checked={finalValue?.includes(choiceValue)}
                            onChange={event => handleChange(event, choiceValue)}
                        />
                    );
                })}
            </CheckboxGroup>
        );

    return <CapCheckbox {...rest} />;
};

export default Checkbox;
