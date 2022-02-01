import * as React from 'react';
import { useIntl } from 'react-intl';
import { SystemStyleObject } from '@styled-system/css';
import {
    Controller,
    ControllerRenderProps,
    FieldValues,
    Control,
    RegisterOptions,
} from 'react-hook-form';
import {
    TextArea,
    Input,
    FormControl,
    FormGuideline,
    FormLabel,
    FormErrorMessage,
    CapInputSize,
    Switch,
    Checkbox,
} from '@cap-collectif/ui';
import { REGEX_EMAIL } from '~/services/Validator';
import { Select, SelectProps } from './Select';
import { MultipleCheckbox, MultipleCheckboxProps } from './MultipleCheckbox';

type FieldType = 'text' | 'textarea' | 'email' | 'select' | 'checkbox' | 'password' | 'switch';

export interface FieldInputProps
    extends Omit<SelectProps & MultipleCheckboxProps, 'value' | 'onChange'> {
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
    validate?: RegisterOptions['validate'];
    pattern?: RegisterOptions['pattern'];
    setValueAs?: RegisterOptions['setValueAs'];
    labelOnElement?: string;
}

export const FieldInput: React.FC<FieldInputProps> = ({
    label,
    guideline,
    name,
    control,
    pattern,
    validate,
    setValueAs,
    labelOnElement,
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
        }: Omit<FieldInputProps, 'label' | 'guideline' | 'name' | 'control' | 'pattern'>,
        field: ControllerRenderProps<FieldValues, string>,
    ) => {
        if (type === 'text' || type === 'email' || type === 'password') {
            return <Input {...rest} {...field} />;
        } else if (type === 'checkbox') {
            if (choices) return <MultipleCheckbox {...rest} {...field} choices={choices} />;
            return (
                <Checkbox {...rest} {...field} checked={field.value}>
                    {labelOnElement}
                </Checkbox>
            );
        } else if (type === 'textarea') return <TextArea {...rest} {...field} />;
        else if (type === 'switch') return <Switch {...rest} {...field} checked={field.value} />;
        else if (type === 'select')
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

    const minLength = props.minLength
        ? {
              value: props.minLength,
              message: intl.formatMessage({ id: 'two-characters-minimum-required' }),
          }
        : undefined;

    const rules: RegisterOptions = {
        required,
        validate,
        minLength,
        pattern:
            props.type === 'email'
                ? {
                      value: REGEX_EMAIL,
                      message: intl.formatMessage({ id: 'global.constraints.email.invalid' }),
                  }
                : pattern,
        setValueAs,
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
                        width="auto"
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
