// @flow
import React, { Component, PropTypes } from 'react';
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
import Editor from './Editor';
import ImageUpload from './ImageUpload';
import Captcha from './Captcha';
import EmailInput from './EmailInput';

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

export default class ReactBootstrapInput extends Component {
  // $FlowFixMe
  constructor(props, context) {
    super(props, context);
    this.refFormControl = null;
  }

  getDOMNode = () => ReactDOM.findDOMNode(this.refFormControl);

  getValue = () => {
    const inputNode = this.getDOMNode();

    // if (this.props.type === 'select' && inputNode.multiple) {
    //   return this.getMultipleSelectValues(inputNode);
    // }

    if (inputNode instanceof HTMLInputElement) {
      return inputNode.value;
    }
  };

  refFormControl: ?Element;

  // getMultipleSelectValues(selectNode) {
  //   const values = [];
  //   const options = selectNode.options;
  //
  //   for (let i = 0; i < options.length; i++) {
  //     const opt = options[i];
  //
  //     if (opt.selected) {
  //       values.push(opt.value || opt.text);
  //     }
  //   }
  //
  //   return values;
  // }

  renderAddon(addon: ?string) {
    return (
      addon &&
      <InputGroup.Addon>
        {addon}
      </InputGroup.Addon>
    );
  }

  renderButton(button: ?string) {
    return (
      button &&
      <InputGroup.Button>
        {button}
      </InputGroup.Button>
    );
  }

  renderInputGroup({
    wrapperClassName,
    addonBefore,
    addonAfter,
    buttonBefore,
    buttonAfter,
    help,
    hasFeedback,
    popover,
    children,
    value,
    type,
    errors,
    image,
    medias,
    ...props
  }: Object) {
    if (type === 'editor') {
      return <Editor value={value} {...props} />;
    }

    if (type === 'captcha') {
      return <Captcha value={value} {...props} />;
    }

    if (type === 'image') {
      return (
        <ImageUpload
          id={props.id}
          className={props.className}
          valueLink={props.valueLink}
          value={value}
          onChange={props.onChange}
          accept="image/*"
          preview={props.image}
        />
      );
    }

    if (type === 'medias') {
      return (
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
        type={props.componentClass ? undefined : type}
        value={value}
        {...props}>
        {children}
      </FormControl>
    );

    if (type === 'checkbox') {
      formControl = (
        <Checkbox value={value} {...props}>
          {children}
        </Checkbox>
      );
    }

    if (type === 'radio') {
      formControl = (
        <Radio value={value} {...props}>
          {children}
        </Radio>
      );
    }

    if (type === 'email') {
      formControl = <EmailInput value={value} {...props} />;
    }

    if (popover) {
      return (
        <OverlayTrigger
          placement="right"
          overlay={
            <Popover id={popover.id}>
              {popover.message}
            </Popover>
          }>
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

    if (!addonBefore && !addonAfter && !buttonBefore && !buttonAfter) {
      return formControl;
    }

    return (
      <InputGroup bsClass={cx('input-group', wrapperClassName)}>
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
      // id,
      label,
      bsSize,
      groupClassName,
      labelClassName,
      standalone,
      validationState,
      ...props
    } = this.props;

    return (
      <FormGroup
        // controlId={id}
        bsSize={bsSize}
        className={props.wrapperClassName}
        bsClass={cx({ 'form-group': !standalone }, groupClassName)}
        validationState={validationState}>
        {label &&
          <ControlLabel bsClass={cx('control-label', labelClassName)}>
            {label}
          </ControlLabel>}
        {props.help &&
          <HelpBlock>
            {props.help}
          </HelpBlock>}
        {this.renderInputGroup(props)}
        {props.errors &&
          <span className="error-block">
            {props.errors}
          </span>}
      </FormGroup>
    );
  }
}

ReactBootstrapInput.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string,
  children: PropTypes.any,
  help: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  bsSize: PropTypes.string,
  wrapperClassName: PropTypes.string,
  groupClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  addonBefore: PropTypes.any,
  addonAfter: PropTypes.any,
  buttonBefore: PropTypes.any,
  buttonAfter: PropTypes.any,
  standalone: PropTypes.bool,
  hasFeedback: PropTypes.bool,
  validationState: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  type: PropTypes.string,
};
