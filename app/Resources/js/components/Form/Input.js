import React from 'react';
import autosize from 'autosize';
import mailcheck from 'mailcheck';
import { OverlayTrigger, Popover, Input as ReactBootstrapInput, FormGroup } from 'react-bootstrap';
import Editor from './Editor';
import ImageUpload from './ImageUpload';
import Captcha from './Captcha';
import domains from '../../utils/email_domains';

export default class Input extends ReactBootstrapInput {

  constructor() {
    super();
    this.state = { suggestion: null };
  }

  setSuggestion() {
    const { onChange } = this.props;
    onChange(this.state.suggestion);
  }

  checkMail() {
    const { value } = this.props;
    mailcheck.run({
      email: value,
      domains,
      suggested: suggestion => this.setState({ suggestion: suggestion.full }),
      empty: () => this.setState({ suggestion: null }),
    });
  }

  componentDidUpdate(prevProps) {
    const {
      type,
      value,
    } = this.props;
    if (type === 'textarea') {
      autosize(this.getInputDOMNode());
    }
    if (type === 'email' && prevProps.value !== value) {
      this.checkMail();
    }
  }

  componentWillUnmount() {
    const { type } = this.props;
    if (type === 'textarea') {
      autosize.destroy(this.getInputDOMNode());
    }
  }

  renderSuggestion() {
    return this.state.suggestion &&
        <p className="registration__help">
          Vouliez vous dire <a href={'#email-correction'} onClick={this.setSuggestion.bind(this)} className="js-email-correction">{ this.state.suggestion }</a> ?
        </p>
    ;
  }

  renderErrors() {
    const { errors } = this.props;
    return errors
      ? (
          <span className="error-block" key="error">
            {errors}
          </span>
        )
      : null
    ;
  }

  renderInput() {
    const {
      type,
      popover,
      className,
      id,
      image,
      medias,
      valueLink,
    } = this.props;
    if (type && type === 'editor') {
      return <Editor {...this.props} />;
    }

    if (type && type === 'captcha') {
      return <Captcha {...this.props} />;
    }

    if (type && type === 'image') {
      return <ImageUpload id={id} className={className} valueLink={valueLink} accept="image/*" preview={image} />;
    }

    if (type && type === 'medias') {
      const acceptedMimeTypes = [
        'image/*',
        'application/pdf',
        'application/txt',
        'application/rtf',
        'application/doc',
        'application/docx',
        'application/xls',
        'application/xlsx',
        'application/ppt',
        'application/pttx',
        'application/odt',
        'application/odg',
        'application/odp',
        'application/ods',
        'application/odc',
        'application/odf',
        'application/odb',
        'application/csv',
        'application/xml',
      ];

      return (
        <ImageUpload
          id={id}
          className={className}
          valueLink={valueLink}
          accept={acceptedMimeTypes.join()}
          maxSize={26214400}
          files={medias}
          disablePreview
          multiple
        />
      );
    }

    if (popover) {
      return (
        <OverlayTrigger placement="right"
          overlay={
            <Popover id={popover.id}>
              { popover.message }
            </Popover>
          }
        >
        {
           super.renderInput()
        }
        </OverlayTrigger>
      );
    }

    return super.renderInput();
  }

  renderImage() {
    const { image } = this.props;
    if (image) {
      return (
        <img role="presentation" src={image} />
      );
    }
  }

  renderFormGroup(children) {
    const { id } = this.props;
    const props = Object.assign({}, this.props);
    if (id) {
      props.controlId = id;
      delete props.id;
    }
    return (
      <FormGroup {...props} >
        {children}
      </FormGroup>
    );
  }

  renderChildren() {
    const { type } = this.props;
    return !this.isCheckboxOrRadio()
      ? [
        this.renderLabel(),
        this.renderHelp(),
        this.renderWrapper([
          this.renderInputGroup(
            this.renderInput(),
          ),
          type !== 'captcha' && this.renderIcon(), // no feedbacks for captcha
        ]),
        this.renderSuggestion(),
        this.renderErrors(),
      ]
      : this.renderWrapper([
        this.renderCheckboxAndRadioWrapper(
          this.renderLabel(
            this.renderInput(),
          ),
        ),
        this.renderErrors(),
        this.renderHelp(),
      ])
    ;
  }

}

Input.PropTypes = {
  errors: React.PropTypes.node,
  image: React.PropTypes.string,
  medias: React.PropTypes.array,
};

Input.defaultProps = {
  errors: null,
  labelClassName: 'h5',
  image: null,
  medias: [],
};
