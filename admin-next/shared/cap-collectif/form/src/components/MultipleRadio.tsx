// @ts-nocheck

import type { FC, ChangeEvent } from 'react';
import { Radio as CapRadio, RadioGroup } from '@cap-collectif/ui';

export type MultipleRadioValue = {
    labels: string[],
};

type Choice = {
    id?: string | null,
    useIdAsValue: boolean,
    label: string,
    disabled?: boolean
};

export interface MultipleRadioProps {
    name: string;
    id: string;
    choices: Choice[];
    value?: MultipleRadioValue;
    onChange?: (value: MultipleRadioValue) => void;
}

export const MultipleRadio: FC<MultipleRadioProps> = ({
    choices,
    value,
    id,
    onChange,
    ...rest
}) => {
    const finalValue = value ? value.labels : [];
    const fieldName = `choices-for-field-${id}`;

    const handleChange = (event: ChangeEvent<HTMLInputElement>, choiceValue: string) => {
        if (finalValue && finalValue.includes(choiceValue)) return;

        const newValue = { labels: [choiceValue] };
        onChange(newValue);
    };

    return (
        <RadioGroup>
            {choices.map((choice, idx) => {
                const choiceKey = choice.id ? `choice-${choice.id}` : `choice-${idx}`;
                const choiceValue = choice.useIdAsValue && choice.id ? choice.id : choice.label;

                return (
                    <CapRadio
                        {...rest}
                        key={choiceKey}
                        name={fieldName}
                        id={`${id}_${choiceKey}`}
                        checked={finalValue?.includes(choiceValue)}
                        onChange={event => handleChange(event, choiceValue)}
                        isDisabled={choice?.disabled ?? false}
                    >
                        {choice.label}
                    </CapRadio>
                );
            })}
        </RadioGroup>
    );
};

export default MultipleRadio;
