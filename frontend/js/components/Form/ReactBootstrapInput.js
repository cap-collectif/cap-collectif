// @flow
import * as React from 'react';
import { injectIntl } from 'react-intl';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import moment from 'moment';
import { FormGroup, FormControl, InputGroup, Thumbnail } from 'react-bootstrap';
import type { IntlShape } from 'react-intl';
import DateTime, {
  type DateProps,
  type DateTimeInputProps,
  type TimeConstraintsProps,
} from './DateTime';
import Ranking from './Ranking/Ranking';
import MultipleCheckbox from './MultipleCheckbox/MultipleCheckbox';
import MultipleRadio from './MultipleRadio/MultipleRadio';
import MultipleRadioButton from './MultipleRadioButton/MultipleRadioButton';
import ButtonGroup from './ButtonGroup';
import ImageUpload from './ImageUpload';
import Captcha from './Captcha';
import EmailInput from './EmailInput';
import AutosizedTextarea from './AutosizedTextarea';
import Address from './Address/Address';
import type { AddressProps } from './Address/Address.type';
import QuestionPrintHelpText from './QuestionPrintHelpText';
import Notepad from '../Ui/Form/Notepad';
import RadioImages from './RadioImages';
import Checkbox from '~/components/Ui/Form/Input/Checkbox/Checkbox';
import Radio from '~/components/Ui/Form/Input/Radio/Radio';
import Help from '~/components/Ui/Form/Help/Help';
import Label from '~/components/Ui/Form/Label/Label';
import Description from '~/components/Ui/Form/Description/Description';
import TextArea from '~/components/Ui/Form/Input/TextArea/TextArea';
import Input from '~/components/Ui/Form/Input/Input';
import FileUpload from '~/components/Form/FileUpload/FileUpload';
import { TYPE_FORM } from '~/constants/FormConstants';
import isQuestionnaire from '~/utils/isQuestionnaire';
import ColorPickerInput from '~/components/Form/ColorPickerInput/ColorPickerInput';
import MultipleMajority from '~/components/Form/MultipleMajority/MultipleMajority';
import type { MajorityProperty } from '~ui/Form/Input/Majority/Majority';
import type { BsSize, ValidationState } from '~/types/ReactBootstrap.type';
import { ALLOWED_IMAGE_MIMETYPES, ALLOWED_MIMETYPES } from '~/config';
import WYSIWYG from './WysiwygEditor';

export type ParentProps = {|
  name?: ?string,
  image?: ?string,
  id: ?string,
  className?: string,
  children?: any,
  help?: string | any,
  helpPrint?: boolean,
  checked?: boolean,
  disabled?: boolean,
  ariaLabel?: string,
  placeholder?: ?string,
  ariaRequired?: boolean,
  description?: string | any,
  backgroundColor?: ?string,
  bsSize?: BsSize,
  wrapperClassName?: ?string,
  groupClassName?: ?string,
  labelClassName?: ?string,
  addonBefore?: any,
  addonAfter?: any,
  buttonBefore?: any,
  buttonAfter?: any,
  standalone?: boolean,
  validationState?: ValidationState,
  validationRule?: Object,
  isOtherAllowed?: boolean,
  label?: string | any,
  type: ?string,
  errors?: any,
  warnings?: any,
  choices?: Array<any>,
  onChange?: any,
  checkedValue?: ?string,
  maxLength?: string,
  minLength?: string,
  onBlur?: any,
  autoComplete?: string,
  autoFocus?: boolean,
  disableValidation?: boolean,
  formName?: string,
  lang?: string,
  step?: any,
  style?: any,
  isRangeBetween?: ?boolean,
  min?: ?number,
  max?: ?number,
  rows?: number,
  // Why do we use this ?
  medias?: Array<any>,
  // Why do we use this ?
  value?: any,
  dateTimeInputProps?: DateTimeInputProps,
  timeConstraints?: TimeConstraintsProps,
  forwardedRef?: any,
  typeForm?: $Values<typeof TYPE_FORM>,
  getOpacity?: (opacity: number) => void,
  opacity?: ?number,
  debounce?: number,
  addressProps?: AddressProps,
  groupedResponsesEnabled?: boolean,
  responseColorsDisabled?: boolean,
  isValidDate?: (current: moment) => boolean,
  withCharacterCounter?: boolean,
  dateProps?: DateProps,
  selectedLanguage?: string,
  maxSize?: number,
  accept?: string | string[],
  noCode?: boolean,
  onKeyDown?: Function,
  captchaRef?: React.Ref<*>,
|};

type Props = {|
  ...ParentProps,
  intl: IntlShape,
|};

class ReactBootstrapInput extends React.Component<Props> {
  static defaultProps = {
    labelClassName: 'h5',
    errors: null,
    warnings: null,
    image: null,
    medias: [],
    accept: [],
    helpPrint: true,
    maxSize: 26214400,
  };

  refFormControl: ?Element;

  constructor(props, context) {
    super(props, context);
    this.refFormControl = null;
  }

  getDOMNode = () => ReactDOM.findDOMNode(this.refFormControl);

  getValue = () => {
    const inputNode = this.getDOMNode();

    if (inputNode instanceof HTMLInputElement) {
      return inputNode.value;
    }
  };

  onAdminEditorChange = (name, state) => {
    const { onChange } = this.props;

    if (onChange) {
      onChange(state.html);
    }
  };

  renderAddon(addon: ?string) {
    return addon && <InputGroup.Addon>{addon}</InputGroup.Addon>;
  }

  renderButton(button: ?string) {
    return button && <InputGroup.Button>{button}</InputGroup.Button>;
  }

  renderInputGroup({
    wrapperClassName,
    addonBefore,
    addonAfter,
    buttonBefore,
    buttonAfter,
    children,
    value,
    type,
    formName,
    errors,
    image,
    medias,
    intl,
    ariaRequired,
    isOtherAllowed,
    min,
    max,
    dateTimeInputProps,
    timeConstraints,
    typeForm,
    getOpacity,
    opacity,
    addressProps,
    debounce,
    isRangeBetween,
    groupedResponsesEnabled,
    responseColorsDisabled,
    isValidDate,
    withCharacterCounter,
    dateProps,
    selectedLanguage,
    maxSize,
    accept,
    noCode,
    captchaRef,
    ...props
  }: Object) {
    if (typeof props.placeholder === 'string' || props.placeholder instanceof String) {
      props.placeholder = intl.formatMessage({ id: props.placeholder });
    }

    const ariaDescribedBy = `${props.id ? `label-${props.id}` : ''} ${
      props.help && props.id ? `${props.id}-help` : ''
    }`;

    const ariaInvalid = !!errors;

    const ariaLabelledby = ariaInvalid
      ? `${props.id ? `label-${props.id} ${props.id}-error` : ''}`
      : undefined;

    if (type === 'editor') {
      return (
        <WYSIWYG
          id={props.id}
          name={props.name}
          initialContent={value}
          onChange={props.onChange}
          withCharacterCounter={withCharacterCounter}
          maxLength={props.maxLength}
          unstable__enableCapcoUiDs={false}
          clientConfig
          selectedLanguage={selectedLanguage}
          formName={formName}
          {...props}
        />
      );
    }

    if (type === 'editor-ds') {
      return (
        <WYSIWYG
          id={props.id}
          name={props.name}
          initialContent={value}
          onChange={props.onChange}
          withCharacterCounter={withCharacterCounter}
          maxLength={props.maxLength}
          unstable__enableCapcoUiDs
          clientConfig
          selectedLanguage={selectedLanguage}
          formName={formName}
          {...props}
        />
      );
    }

    if (type === 'admin-editor' || type === 'admin-editor-ds') {
      return (
        <WYSIWYG
          id={props.id}
          name={props.name}
          initialContent={value}
          onChange={props.onChange}
          withCharacterCounter={withCharacterCounter}
          maxLength={props.maxLength}
          selectedLanguage={selectedLanguage}
          unstable__enableCapcoUiDs={type === 'admin-editor-ds'}
          formName={formName}
          noCode={noCode}
          {...props}
        />
      );
    }

    if (type === 'captcha') {
      return <Captcha captchaRef={captchaRef} {...props} />;
    }
    if (type === 'image') {
      return (
        <div className="hidden-print">
          <ImageUpload
            id={props.id}
            className={props.className}
            value={value}
            onChange={props.onChange}
            accept={ALLOWED_IMAGE_MIMETYPES}
            maxSize={maxSize}
            preview={props.image}
            {...props}
          />
        </div>
      );
    }

    if (type === 'medias') {
      if (isQuestionnaire(typeForm)) {
        return (
          <FileUpload
            id={props.id}
            className={props.className}
            typeForm={typeForm}
            onChange={props.onChange}
            value={value}
            disabled={props.disabled}
          />
        );
      }

      return (
        <div className="hidden-print">
          <ImageUpload
            id={props.id}
            className={props.className}
            value={value}
            onChange={props.onChange}
            accept={ALLOWED_MIMETYPES.join()}
            maxSize={maxSize}
            disablePreview
            multiple
          />
        </div>
      );
    }

    if (type === 'select' || type === 'textarea') {
      props.componentClass = type;
    }

    if (type === 'number') {
      if (!addonBefore && !addonAfter && !buttonBefore && !buttonAfter && !wrapperClassName) {
        return (
          <FormControl
            ref={c => {
              this.refFormControl = c;
            }}
            min={min}
            max={max}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            aria-required={ariaRequired}
            type="number"
            value={value}
            {...props}>
            {children}
          </FormControl>
        );
      }

      return (
        <InputGroup className="form-fields" bsClass={cx('input-group', wrapperClassName)}>
          {this.renderAddon(addonBefore)}
          {this.renderButton(buttonBefore)}
          <FormControl
            ref={c => {
              this.refFormControl = c;
            }}
            min={min}
            max={max}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            aria-required={ariaRequired}
            type="number"
            value={value}
            {...props}>
            {children}
          </FormControl>
          {this.renderButton(buttonAfter)}
          {this.renderAddon(addonAfter)}
        </InputGroup>
      );
    }

    if (type === 'text' && isQuestionnaire(typeForm)) {
      return <Input type={type} required={ariaRequired} value={value} {...props} />;
    }

    let formControl = (
      <FormControl
        ref={c => {
          this.refFormControl = c;
        }}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
        type={props.componentClass ? undefined : type !== 'number' ? type : 'text'}
        value={value}
        aria-labelledby={ariaLabelledby}
        {...props}>
        {children}
      </FormControl>
    );

    if (type === 'datetime') {
      formControl = (
        <DateTime
          {...dateProps}
          value={value}
          dateTimeInputProps={dateTimeInputProps}
          timeConstraints={timeConstraints}
          isValidDate={isValidDate}
          {...props}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
        />
      );
    }

    if (type === 'checkbox') {
      if (props.choices) {
        // Custom checkbox type
        const field = {
          id: props.id,
          type,
          isOtherAllowed,
          choices: props.choices,
          checked: props.checked,
        };

        return (
          <MultipleCheckbox
            value={value}
            field={field}
            errors={errors}
            typeForm={typeForm}
            {...props}
          />
        );
      }

      formControl = <Checkbox value={value} label={children} typeForm={typeForm} {...props} />;
    }

    if (type === 'radio') {
      if (props.choices) {
        // Custom radio type
        const field = {
          id: props.id,
          type,
          isOtherAllowed,
          choices: props.choices,
          checked: props.checked,
        };

        return (
          <MultipleRadio
            value={value}
            field={field}
            errors={errors}
            typeForm={typeForm}
            {...props}
          />
        );
      }

      formControl = <Radio value={value} label={children} typeForm={typeForm} {...props} />;
    }

    if (type === 'button') {
      const field = {
        id: props.id,
        choices: props.choices,
      };
      if (groupedResponsesEnabled) {
        const choices: MajorityProperty[] = props.choices.map(choice => ({
          color: choice.color,
          id: choice.id,
          label: choice.label,
          value: choice.label,
        }));
        return (
          <MultipleMajority
            {...props}
            disableColors={responseColorsDisabled}
            enableBars={groupedResponsesEnabled}
            value={value}
            field={field}
            errors={errors}
            choices={choices}
          />
        );
      }

      return (
        <MultipleRadioButton
          value={value}
          field={field}
          {...props}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          disableColors={responseColorsDisabled}
        />
      );
    }

    if (type === 'majority') {
      const field = {
        id: props.id,
      };

      return <MultipleMajority value={value} field={field} errors={errors} {...props} />;
    }

    if (type === 'address') {
      return (
        <Address
          formName={formName}
          value={value}
          debounce={debounce}
          {...addressProps}
          {...props}
        />
      );
    }

    if (type === 'radio-buttons') {
      return (
        <ButtonGroup type="radio" value={value} {...props}>
          {children}
        </ButtonGroup>
      );
    }

    if (type === 'radio-images') {
      return (
        <RadioImages value={value} medias={medias} {...props}>
          {children}
        </RadioImages>
      );
    }

    if (type === 'ranking') {
      let values;
      let choices;
      if (value) {
        values = value.map(v => props.choices.find(choice => v === choice.label)).filter(v => v);

        choices = props.choices.filter(
          choice => choice.label !== value.find(val => val === choice.label),
        );
      } else {
        // eslint-disable-next-line prefer-destructuring
        choices = props.choices;
      }

      const field = {
        id: props.id,
        choices,
        values,
      };

      return <Ranking formName={formName} field={field} onBlur={props.onBlur} {...props} />;
    }

    if (type === 'email') {
      formControl = (
        <EmailInput
          value={value}
          {...props}
          aria-describedby={ariaDescribedBy}
          aria-labelledby={ariaLabelledby}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
        />
      );
    }

    if (type === 'textarea') {
      formControl = (
        <React.Fragment>
          <AutosizedTextarea
            maxLength={props.maxLength}
            minLength={props.minLength}
            value={value}
            {...props}
            aria-describedby={ariaDescribedBy}
            aria-labelledby={ariaLabelledby}
            aria-invalid={ariaInvalid}
            aria-required={ariaRequired}
          />
          <Notepad />
        </React.Fragment>
      );

      if (isQuestionnaire(typeForm)) {
        formControl = <TextArea value={value} maxLength={props.maxLength} {...props} />;
      }
    }

    if (type === 'color-picker') {
      return (
        <ColorPickerInput value={value} getOpacity={getOpacity} opacity={opacity} {...props} />
      );
    }

    if (image) {
      return (
        <Thumbnail src={image} style={{ textAlign: 'center' }}>
          {formControl}
        </Thumbnail>
      );
    }

    if (!addonBefore && !addonAfter && !buttonBefore && !buttonAfter && !wrapperClassName) {
      return formControl;
    }

    return (
      <InputGroup className="form-fields" bsClass={cx('input-group', wrapperClassName)}>
        {this.renderAddon(addonBefore)}
        {this.renderButton(buttonBefore)}
        {formControl}
        {this.renderButton(buttonAfter)}
        {this.renderAddon(addonAfter)}
      </InputGroup>
    );
  }

  render() {
    const {
      label,
      bsSize,
      groupClassName,
      labelClassName,
      standalone,
      validationState,
      validationRule,
      helpPrint,
      forwardedRef,
      ...props
    } = this.props;

    const {
      id,
      choices,
      type,
      help,
      description,
      errors,
      warnings,
      typeForm = TYPE_FORM.DEFAULT,
    } = props;

    return (
      <FormGroup
        bsSize={bsSize}
        bsClass={cx({ 'form-group': !standalone }, groupClassName)}
        validationState={validationState}>
        {label && (
          <Label
            htmlFor={id || ''}
            className={cx('control-label', labelClassName)}
            type="label"
            id={id ? `label-${id}` : ''}>
            {label}
          </Label>
        )}

        <QuestionPrintHelpText
          validationRule={validationRule || null}
          questionType={type}
          choices={choices}
          helpPrint={helpPrint}
        />

        {help && (
          <Help id={`${id ? `${id}-help` : ''}`} typeForm={typeForm}>
            {help}
          </Help>
        )}

        {description && <Description typeForm={typeForm}>{description}</Description>}
        {this.renderInputGroup(props)}

        {errors && (
          <span className="error-block hidden-print" id={`${id ? `${id}-error` : ''}`}>
            {errors.props.values && errors.props.values.before && (
              <span dangerouslySetInnerHTML={{ __html: errors.props.values.before }} />
            )}
            {errors}
          </span>
        )}
        {!errors && warnings && (
          <span
            style={{ color: 'orange' }}
            className="error-block hidden-print"
            id={`${id ? `${id}-error` : ''}`}>
            {warnings}
          </span>
        )}
      </FormGroup>
    );
  }
}

export default injectIntl(ReactBootstrapInput, { forwardRef: true });
