import React from 'react';
import Editor from './Editor';
import autosize from 'autosize';
import ImageUpload from './ImageUpload';
import { OverlayTrigger, Popover, Input as ReactBootstrapInput, FormGroup } from 'react-bootstrap';
import Captcha from './Captcha';
import mailcheck from 'mailcheck';
import domains from '../../utils/email_domains';

export default class Input extends ReactBootstrapInput {

  constructor() {
    super();
    this.state = { suggestion: null };
  }

  setSuggestion() {
    this.props.onChange(this.state.suggestion);
  }

  checkMail() {
    mailcheck.run({
      email: this.props.value,
      domains: domains,
      suggested: suggestion => this.setState({ suggestion: suggestion.full }),
      empty: () => this.setState({ suggestion: null }),
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.type === 'textarea') {
      autosize(this.getInputDOMNode());
    }
    if (this.props.type === 'email' && prevProps.value !== this.props.value) {
      this.checkMail();
    }
  }

  componentWillUnmount() {
    if (this.props.type === 'textarea') {
      autosize.destroy(this.getInputDOMNode());
    }
  }

  renderSuggestion() {
    return this.state.suggestion &&
        <p className="registration__help">
          Vouliez vous dire <a href={'#'} onClick={this.setSuggestion.bind(this)} className="js-email-correction">{ this.state.suggestion }</a> ?
        </p>
    ;
  }

  renderErrors() {
    return this.props.errors
      ? (
          <span className="error-block" key="error">
            {this.props.errors}
          </span>
        )
      : null
    ;
  }

  renderInput() {
    const { type, popover } = this.props;
    if (type && type === 'editor') {
      return <Editor {...this.props} />;
    }

    if (type && type === 'captcha') {
      return <Captcha {...this.props} />;
    }

    if (type && type === 'image') {
      return <ImageUpload id={this.props.id} className={this.props.className} valueLink={this.props.valueLink} preview={this.props.image} />;
    }

    if (popover) {
      return (
        <OverlayTrigger placement="right"
          overlay={
            <Popover id={ popover.id }>
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
    if (this.props.image) {
      return (
        <img src={this.props.image} />
      );
    }
  }

  renderFormGroup(children) {
    const props = Object.assign({}, this.props);
    if (this.props.id) {
      props.controlId = this.props.id;
      delete props.id;
    }
    return (
      <FormGroup {...props} >
        {children}
      </FormGroup>
    );
  }

  renderChildren() {
    return !this.isCheckboxOrRadio()
      ? [
        this.renderLabel(),
        this.renderHelp(),
        this.renderWrapper([
          this.renderInputGroup(
            this.renderInput()
          ),
          this.props.type !== 'captcha' && this.renderIcon(), // no feedbacks for captcha
        ]),
        this.renderSuggestion(),
        this.renderImage(),
        this.renderErrors(),
      ]
      : this.renderWrapper([
        this.renderCheckboxAndRadioWrapper(
          this.renderLabel(
            this.renderInput()
          )
        ),
        this.renderErrors(),
        this.renderHelp(),
        this.renderImage(),
      ])
    ;
  }

}

Input.PropTypes = {
  errors: React.PropTypes.node,
  image: React.PropTypes.string,
};

Input.defaultProps = {
  errors: null,
  labelClassName: 'h5',
  image: null,
};
