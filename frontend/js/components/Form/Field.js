// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import Input from './Input';
import { TYPE_FORM } from '~/constants/FormConstants';
import isQuestionnaire from '~/utils/isQuestionnaire';
import type { AddressProps } from '~/components/Form/Address/Address.type';
import type {
  DateTimeInputProps,
  TimeConstraintsProps,
  DateProps,
} from '~/components/Form/DateTime';

type Props = {|
  meta: {
    touched: boolean,
    dirty?: boolean,
    pristine?: boolean,
    error?: any,
    warning?: any,
  },
  backgroundColor?: ?string,
  labelClassName?: string,
  // use this one to set class on div before form-group
  divClassName?: string,
  wrapperClassName?: string,
  // use this one to set class on div on form-group
  groupClassName?: ?string,
  help?: string,
  helpPrint?: boolean,
  ariaRequired?: boolean,
  description?: string,
  formName?: string,
  autoComplete?: string,
  disableValidation?: boolean,
  hideValidationMessage: boolean,
  selectedLanguage?: string,
  rows?: number,
  type:
    | 'address'
    | 'text'
    | 'number'
    | 'datetime'
    | 'textarea'
    | 'editor'
    | 'admin-editor'
    | 'select'
    | 'checkbox'
    | 'password'
    | 'captcha'
    | 'email'
    | 'radio-buttons'
    | 'image'
    | 'medias'
    | 'ranking'
    | 'radio'
    | 'button'
    | 'radio-images',
  addonAfter?: any,
  addonBefore?: any,
  label?: any,
  placeholder?: string,
  disabled?: boolean,
  isOtherAllowed?: boolean,
  validationRule?: {
    type: string,
    number: number,
  },
  image?: string,
  children?: any,
  min?: ?number,
  max?: ?number,
  id: string,
  popover?: Object,
  choices?: Array<$FlowFixMe>,
  radioChecked?: boolean,
  input: {|
    name: string,
    autoFocus?: boolean,
    onChange?: Function,
    onBlur?: Function,
    value?: any,
    disableValidation?: boolean,
    label?: string,
  |},
  style?: Object,
  radioImage?: Object,
  lang?: string,
  rows?: number,
  // to use in case of decimal number input
  step?: string,
  dateTimeInputProps?: DateTimeInputProps,
  timeConstraints?: TimeConstraintsProps,
  medias?: Array<Object>,
  typeForm?: $Values<typeof TYPE_FORM>,
  getOpacity?: (opacity: number) => void,
  opacity?: ?number,
  debounce?: number,
  addressProps?: AddressProps,
  maxLength?: string,
  minLength?: string,
  groupedResponsesEnabled?: boolean,
  responseColorsDisabled?: boolean,
  isValidDate?: (current: moment) => boolean,
  withCharacterCounter?: boolean,
  dateProps?: DateProps,
  maxSize?: number,
  accept?: Array<string>,
  fieldUsingJoditWysiwyg?: boolean,
  fieldUsingJoditWysiwygName?: string,
  noCode?: boolean,
  onKeyDown?: Function,
|};

const canCheckValidation = (check, typeForm, disableValidation) =>
  (check && !disableValidation && !isQuestionnaire(typeForm)) ||
  (!disableValidation && isQuestionnaire(typeForm));

class Field extends React.Component<Props> {
  render() {
    const {
      meta: { touched, dirty, error, warning },
      input,
      popover,
      children,
      id,
      autoComplete,
      disableValidation,
      placeholder,
      type,
      label,
      divClassName,
      wrapperClassName,
      groupClassName,
      labelClassName,
      disabled,
      help,
      helpPrint,
      ariaRequired,
      description,
      formName,
      addonAfter,
      addonBefore,
      choices,
      isOtherAllowed,
      validationRule,
      style,
      radioImage,
      hideValidationMessage = false,
      lang,
      step,
      min,
      max,
      dateTimeInputProps,
      medias,
      rows,
      typeForm = TYPE_FORM.DEFAULT,
      getOpacity,
      opacity,
      debounce,
      addressProps,
      maxLength,
      minLength,
      groupedResponsesEnabled,
      responseColorsDisabled,
      isValidDate,
      timeConstraints,
      withCharacterCounter,
      dateProps,
      selectedLanguage,
      maxSize,
      accept,
      fieldUsingJoditWysiwyg,
      fieldUsingJoditWysiwygName,
      noCode,
      onKeyDown,
    } = this.props;
    const check = touched || (dirty && !disableValidation);

    let errorMessage = null;
    let warningMessage = null;

    if (canCheckValidation(check, typeForm, disableValidation) && error && !hideValidationMessage) {
      if (error.id) {
        errorMessage = <FormattedMessage id={error.id} values={error.values} />;
      } else {
        errorMessage = <FormattedMessage id={error} />;
      }
    }

    if (canCheckValidation(check, typeForm, disableValidation) && warning) {
      if (warning.id) {
        warningMessage = <FormattedMessage id={warning.id} values={warning.values} />;
      } else {
        warningMessage = <FormattedMessage id={warning} />;
      }
    }

    const component = (
      <Input
        id={id}
        type={type}
        name={input.name}
        min={min}
        max={max}
        help={help}
        helpPrint={helpPrint}
        ariaRequired={ariaRequired}
        description={description}
        formName={formName}
        disabled={disabled}
        popover={popover}
        addonAfter={addonAfter}
        image={radioImage ? radioImage.url : null}
        addonBefore={addonBefore}
        isOtherAllowed={isOtherAllowed}
        wrapperClassName={wrapperClassName || ''}
        groupClassName={groupClassName || ''}
        labelClassName={labelClassName || ''}
        label={label || null}
        placeholder={placeholder || null}
        errors={errorMessage}
        warnings={warningMessage}
        validationState={
          canCheckValidation(check, typeForm, disableValidation)
            ? error
              ? 'error'
              : 'success'
            : null
        }
        validationRule={validationRule}
        autoComplete={autoComplete}
        autoFocus={input.autoFocus || false}
        choices={choices}
        typeForm={typeForm}
        style={style}
        rows={rows}
        lang={lang}
        step={step}
        medias={medias}
        dateTimeInputProps={dateTimeInputProps}
        getOpacity={getOpacity}
        opacity={opacity}
        debounce={debounce}
        addressProps={addressProps}
        maxLength={maxLength}
        minLength={minLength}
        groupedResponsesEnabled={groupedResponsesEnabled}
        responseColorsDisabled={responseColorsDisabled}
        isValidDate={isValidDate}
        timeConstraints={timeConstraints}
        withCharacterCounter={withCharacterCounter}
        dateProps={dateProps}
        selectedLanguage={selectedLanguage}
        maxSize={maxSize}
        accept={accept}
        fieldUsingJoditWysiwyg={fieldUsingJoditWysiwyg}
        fieldUsingJoditWysiwygName={fieldUsingJoditWysiwygName}
        noCode={noCode}
        onKeyDown={onKeyDown}
        {...input}>
        {children}
      </Input>
    );
    if (divClassName) {
      return <div className={divClassName}>{component}</div>;
    }
    return component;
  }
}

export default Field;
