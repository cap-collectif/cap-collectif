// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { Controller } from 'react-hook-form';
import {
  TextArea,
  Input,
  FormControl,
  FormGuideline,
  FormLabel,
  FormErrorMessage,
} from '@cap-collectif/ui';
import { isEmail } from '~/services/Validator';
import Captcha from './Captcha';

export type Props = {|
  control: any,
  name?: ?string,
  id: ?string,
  required?: boolean,
  disabled?: boolean,
  placeholder?: ?string,
  validationRule?: Object,
  label?: string | any,
  type: ?string,
  onChange?: any,
  maxLength?: number,
  minLength?: number,
  onBlur?: any,
  maxSize?: number,
  accept?: string | string[],
  guideline?: string,
  validate?: Object,
|};

const FieldInput = ({ label, guideline, name, control, ...props }: Props) => {
  const intl = useIntl();

  const renderInputGroup = ({ type, maxSize, accept, ...rest }: Object, field) => {
    if (typeof rest.placeholder === 'string' || rest.placeholder instanceof String) {
      rest.placeholder = intl.formatMessage({ id: rest.placeholder });
    }

    if (type === 'text' || type === 'email') {
      return <Input {...rest} {...field} />;
    }

    if (type === 'textarea') {
      return <TextArea {...rest} {...field} />;
    }

    if (type === 'captcha') {
      return <Captcha {...rest} {...field} />;
    }
  };

  const required = props.required ? intl.formatMessage({ id: 'global.required' }) : undefined;

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
          <FormControl variantSize="md" isRequired={props.required} isInvalid={isInvalid} mb={4}>
            {label && <FormLabel label={label} htmlFor={props.id} />}
            {guideline && <FormGuideline>{guideline}</FormGuideline>}
            {renderInputGroup(props, field)}
            {isInvalid && error?.message && <FormErrorMessage>{error?.message}</FormErrorMessage>}
          </FormControl>
        );
      }}
    />
  );
};

export default FieldInput;
