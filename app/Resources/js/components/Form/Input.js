import React from 'react';
import Editor from './Editor';
import {Input as ReactBootstrapInput} from 'react-bootstrap';

export default class Input extends ReactBootstrapInput {

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
};
