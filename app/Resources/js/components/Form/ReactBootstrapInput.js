// @flow
import * as React from 'react';
import { injectIntl } from 'react-intl';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock,
  InputGroup,
  Thumbnail,
  Checkbox,
  OverlayTrigger,
  Popover,
  Radio,
} from 'react-bootstrap';
import type { IntlShape } from 'react-intl';
import DateTime from './DateTime';
import Editor from './Editor';
import Ranking from './Ranking';
import MultipleChoiceCheckbox from './Checkbox';
import ButtonGroup from './ButtonGroup';
import ImageUpload from './ImageUpload';
import Captcha from './Captcha';
import EmailInput from './EmailInput';
import AutosizedTextarea from './AutosizedTextarea';
import Address from './Address';
import ButtonBody from '../Reply/Form/ButtonBody';
import QuestionPrintHelpText from './QuestionPrintHelpText';
import Notepad from '../Ui/Form/Notepad';
import RadioButtons from './RadioButtons';

const acceptedMimeTypes = [
  'image/*',
  'application/pdf',
  'application/x-pdf',
  'application/txt',
  'application/rtf',
  'text/rtf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.graphics',
  'application/vnd.oasis.opendocument.presentation',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.chart',
  'application/vnd.oasis.opendocument.formula',
  'application/vnd.oasis.opendocument.database',
  'text/csv',
  'application/xml',
];

type Props = {
  intl: IntlShape,
  name?: ?string,
  image?: ?string,
  id: ?string,
  children?: any,
  help?: string | any,
  helpPrint: boolean,
  description?: string | any,
  backgroundColor?: ?string,
  bsSize?: string,
  wrapperClassName?: ?string,
  groupClassName?: ?string,
  labelClassName?: ?string,
  addonBefore?: any,
  addonAfter?: any,
  buttonBefore?: any,
  buttonAfter?: any,
  standalone?: boolean,
  validationState?: ?string,
  validationRule?: Object,
  isOtherAllowed?: boolean,
  label?: string | any,
  type: ?string,
  errors?: any,
  choices?: Array<any>,
  onChange?: any,
  radioChecked?: boolean,
  checkedValue?: ?string,
  maxLength?: ?string,
};

class ReactBootstrapInput extends React.Component<Props> {
  static defaultProps = {
    labelClassName: 'h5',
    errors: null,
    image: null,
    medias: [],
    helpPrint: true,
  };

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

  refFormControl: ?Element;

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
    popover,
    children,
    value,
    type,
    formName,
    errors,
    image,
    medias,
    intl,
    isOtherAllowed,
    radioChecked,
    ...props
  }: Object) {
    if (typeof props.placeholder === 'string' || props.placeholder instanceof String) {
      props.placeholder = intl.formatMessage({ id: props.placeholder });
    }

    const ariaDescribedBy = `${props.id ? props.id : ''}-error`;

    if (type === 'editor') {
      return (
        <React.Fragment>
          <Editor value={value} className={wrapperClassName} {...props} />
          <Notepad />
        </React.Fragment>
      );
    }

    if (type === 'captcha') {
      return <Captcha value={value} {...props} />;
    }

    if (type === 'image') {
      return (
        <div className="hidden-print">
          <ImageUpload
            id={props.id}
            className={props.className}
            valueLink={props.valueLink}
            value={value}
            onChange={props.onChange}
            accept="image/*"
            preview={props.image}
          />
        </div>
      );
    }

    if (type === 'medias') {
      return (
        <div className="hidden-print">
          <ImageUpload
            id={props.id}
            className={props.className}
            valueLink={props.valueLink}
            value={value}
            onChange={props.onChange}
            accept={acceptedMimeTypes.join()}
            maxSize={26214400}
            files={medias}
            disablePreview
            multiple
          />
        </div>
      );
    }

    if (type === 'select' || type === 'textarea') {
      props.componentClass = type;
    }

    let formControl = (
      <FormControl
        ref={c => {
          this.refFormControl = c;
        }}
        aria-describedby={ariaDescribedBy}
        type={props.componentClass ? undefined : type !== 'number' ? type : 'text'}
        value={value}
        {...props}>
        {children}
      </FormControl>
    );

    if (type === 'datetime') {
      formControl = <DateTime value={value} {...props} aria-describedby={ariaDescribedBy} />;
    }

    if (type === 'checkbox') {
      if (props.choices) {
        // Custom checkbox type
        const field = {};
        field.id = props.id;
        field.type = type;
        field.isOtherAllowed = isOtherAllowed;
        field.choices = props.choices;
        field.checked = props.checked;
        return (
          <MultipleChoiceCheckbox
            value={value}
            field={field}
            aria-describedby={ariaDescribedBy}
            label={null}
            renderFormErrors={() => {}}
            getGroupStyle={() => {}}
            errors={errors}
            {...props}
          />
        );
      }

      formControl = (
        <Checkbox value={value} {...props}>
          {children}
        </Checkbox>
      );
    }

    if (type === 'button') {
      const field = {};
      field.id = props.id;
      field.choices = props.choices;

      return (
        <RadioButtons value={value} field={field} {...props} aria-describedby={ariaDescribedBy} />
      );
    }

    if (type === 'radio') {
      formControl = (
        <Radio
          value={value}
          {...props}
          checked={radioChecked}
          isOtherAllowed={isOtherAllowed}
          aria-describedby={`${props.id ? props.id : ''}-error`}>
          {children}
        </Radio>
      );
    }

    if (type === 'address') {
      return <Address formName={formName} value={value} {...props} />;
    }

    if (type === 'radio-buttons') {
      return (
        <ButtonGroup type="radio" value={value} {...props}>
          {children}
        </ButtonGroup>
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
        choices = props.choices;
      }
      const field = {};
      field.id = props.id;
      field.choices = choices;
      field.values = values;
      return (
        <Ranking
          formName={formName}
          field={field}
          aria-describedby={ariaDescribedBy}
          label={null}
          renderFormErrors={() => {}}
          getGroupStyle={() => {}}
          labelClassName="h4"
          onBlur={props.onBlur}
          {...props}
        />
      );
    }

    if (type === 'email') {
      formControl = <EmailInput value={value} {...props} aria-describedby={ariaDescribedBy} />;
    }

    if (type === 'textarea') {
      formControl = (
        <React.Fragment>
          <AutosizedTextarea
            maxLength={props.maxLength}
            value={value}
            {...props}
            aria-describedby={ariaDescribedBy}
          />
          <Notepad />
        </React.Fragment>
      );
    }

    if (popover) {
      return (
        <OverlayTrigger
          placement={window.innerWidth >= 768 ? 'right' : 'top'}
          overlay={<Popover id={popover.id}>{popover.message}</Popover>}>
          {formControl}
        </OverlayTrigger>
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
      label, // eslint-disable-line
      bsSize, // eslint-disable-line
      groupClassName, // eslint-disable-line
      labelClassName, // eslint-disable-line
      standalone, // eslint-disable-line
      validationState, // eslint-disable-line
      validationRule, // eslint-disable-line
      helpPrint,
      ...props
    } = this.props;

    return (
      <FormGroup
        bsSize={bsSize}
        bsClass={cx({ 'form-group': !standalone }, groupClassName)}
        validationState={validationState}>
        {label && (
          <ControlLabel htmlFor={this.props.id} bsClass={cx('control-label', labelClassName)}>
            {label}
          </ControlLabel>
        )}
        <QuestionPrintHelpText
          validationRule={validationRule || null}
          questionType={props.type}
          choices={this.props.choices}
          helpPrint={helpPrint}
        />
        {props.help && <HelpBlock>{props.help}</HelpBlock>}
        {props.description && props.description !== '<div><br /></div>' && (
          <div className="pb-15">
            <ButtonBody body={props.description || ''} />
          </div>
        )}
        {this.renderInputGroup(props)}
        {props.errors && (
          <span className="error-block hidden-print" id={`${props.id ? props.id : ''}-error`}>
            {props.errors}
          </span>
        )}
      </FormGroup>
    );
  }
}

export default injectIntl(ReactBootstrapInput, { withRef: true });
