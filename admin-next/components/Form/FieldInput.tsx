import * as React from 'react';
import { useIntl } from 'react-intl';
import { SystemStyleObject } from '@styled-system/css';
import { Controller, ControllerRenderProps, FieldValues, Control } from 'react-hook-form';
import {
    TextArea,
    Input,
    FormControl,
    FormGuideline,
    FormLabel,
    FormErrorMessage,
    CapInputSize,
} from '@cap-collectif/ui';
import { isEmail } from '~/services/Validator';
import { Select, SelectProps } from './Select';
import { Checkbox, CheckboxProps } from './Checkbox';

type FieldType = 'text' | 'textarea' | 'email' | 'select' | 'checkbox';

export interface FieldInputProps
    extends Omit<SelectProps, 'value' | 'onChange'>,
        Omit<CheckboxProps, 'value' | 'onChange'> {
    control: Control<any>;
    name: string;
    id: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    label?: string;
    type?: FieldType;
    maxLength?: number;
    minLength?: number;
    maxSize?: number;
    accept?: string | string[];
    guideline?: string;
    style?: SystemStyleObject;
}

export const FieldInput: React.FC<FieldInputProps> = ({
    label,
    guideline,
    name,
    control,
    ...props
}) => {
    const intl = useIntl();

    const renderInputGroup = (
        {
            type,
            maxSize,
            accept,
            choices,
            options,
            loadOptions,
            style,
            noOptionsMessage,
            loadingMessage,
            ...rest
        }: Omit<FieldInputProps, 'label' | 'guideline' | 'name' | 'control'>,
        field: ControllerRenderProps<FieldValues, string>,
    ) => {
        if (type === 'text' || type === 'email') return <Input {...rest} {...field} />;
        if (type === 'checkbox') return <Checkbox {...rest} {...field} choices={choices} />;
        if (type === 'textarea') return <TextArea {...rest} {...field} />;
        if (type === 'select')
            return (
                <Select
                    options={options}
                    loadOptions={loadOptions}
                    noOptionsMessage={noOptionsMessage}
                    loadingMessage={loadingMessage}
                    {...rest}
                    {...field}
                />
            );
    };

    const required = props.required ? intl.formatMessage({ id: 'fill-field' }) : undefined;

    const validateEmail =
        props.type === 'email'
            ? (value: string) =>
                  isEmail(value) || intl.formatMessage({ id: 'global.constraints.email.invalid' })
            : undefined;

    const minLength = props.minLength
        ? {
              value: props.minLength,
              message: intl.formatMessage({ id: 'two-characters-minimum-required' }),
          }
        : undefined;

    const rules = {
        required,
        validate: validateEmail,
        minLength,
    };
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState: { invalid, error }, formState: { touchedFields } }) => {
                const isInvalid = invalid && touchedFields[name];
                return (
                    <FormControl
                        variantSize={CapInputSize.Sm}
                        isRequired={props.required}
                        isInvalid={isInvalid}
                        mb={4}>
                        {label && <FormLabel label={label} htmlFor={props.id} />}
                        {guideline && <FormGuideline>{guideline}</FormGuideline>}
                        {renderInputGroup(props, field)}
                        {isInvalid && error?.message && (
                            <FormErrorMessage>{error?.message}</FormErrorMessage>
                        )}
                    </FormControl>
                );
            }}
        />
    );
};

export default FieldInput;
