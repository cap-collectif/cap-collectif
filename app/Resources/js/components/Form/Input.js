import React from 'react';
import Editor from './Editor';
import autosize from 'autosize';
import { Input as ReactBootstrapInput } from 'react-bootstrap';

export default class Input extends ReactBootstrapInput {

  componentDidUpdate() {
    if (this.props.type === 'textarea') {
      autosize(this.getInputDOMNode());
    }
  }

  componentWillUnmount() {
    if (this.props.type === 'textarea') {
      autosize.destroy(this.getInputDOMNode());
    }
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
    if (this.props.type && this.props.type === 'editor') {
      return <Editor id={this.props.id} className={this.props.className} valueLink={this.props.valueLink} />;
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

  renderChildren() {
    return !this.isCheckboxOrRadio()
      ? [
        this.renderLabel(),
        this.renderHelp(),
        this.renderWrapper([
          this.renderInputGroup(
            this.renderInput()
          ),
          this.renderIcon(),
        ]),
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
};

Input.defaultProps = {
  errors: null,
  labelClassName: 'h5',
  image: null,
};
