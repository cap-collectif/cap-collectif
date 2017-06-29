// @flow
import React from 'react';
// import autosize from 'autosize';
// import mailcheck from 'mailcheck';
// import { OverlayTrigger, Popover, FormGroup, Thumbnail } from 'react-bootstrap';
// import domains from '../../utils/email_domains';
import ReactBootstrapInput from './ReactBootstrapInput';

export default class Input extends ReactBootstrapInput {
  constructor(props, context) {
    super(props, context);
    this.state = { suggestion: null };
  }

  // setSuggestion() {
  //   const { onChange } = this.props;
  //   onChange(this.state.suggestion);
  // }
  //
  // checkMail() {
  //   const { value } = this.props;
  //   mailcheck.run({
  //     email: value,
  //     domains,
  //     suggested: suggestion => this.setState({ suggestion: suggestion.full }),
  //     empty: () => this.setState({ suggestion: null }),
  //   });
  // }

  // componentDidUpdate(prevProps) {
  //   const { type, value } = this.props;
  //   if (type === 'textarea') {
  //     autosize(this.getInputDOMNode());
  //   }
  //   if (type === 'email' && prevProps.value !== value) {
  //     this.checkMail();
  //   }
  // }

  // componentWillUnmount() {
  //   const { type } = this.props;
  //   if (type === 'textarea') {
  //     autosize.destroy(this.getInputDOMNode());
  //   }
  // }

  // renderSuggestion() {
  //   return (
  //     this.state.suggestion &&
  //     <p className="registration__help">
  //       Vouliez vous dire
  //       {' '}
  //       <a
  //         href={'#email-correction'}
  //         onClick={this.setSuggestion.bind(this)}
  //         className="js-email-correction">
  //         {this.state.suggestion}
  //       </a>
  //       {' '}
  //       ?
  //     </p>
  //   );
  // }

  // renderChildren() {
  //   const { type, image } = this.props;
  //   if (!this.isCheckboxOrRadio()) {
  //     return [
  //       this.renderLabel(),
  //       this.renderHelp(),
  //       this.renderWrapper([
  //         this.renderInputGroup(this.renderInput()),
  //         type !== 'captcha' && this.renderIcon(), // no feedbacks for captcha
  //       ]),
  //       this.renderSuggestion(),
  //       this.renderErrors(),
  //     ];
  //   }
  //   if (!image) {
  //     return this.renderWrapper([
  //       this.renderCheckboxAndRadioWrapper(
  //         this.renderLabel(this.renderInput()),
  //       ),
  //       this.renderErrors(),
  //       this.renderHelp(),
  //     ]);
  //   }
  //   return this.renderWrapper([
  //     <Thumbnail src={image} style={{ textAlign: 'center' }}>
  //       {this.renderCheckboxAndRadioWrapper(
  //         this.renderLabel(this.renderInput()),
  //       )}
  //       {this.renderHelp()}
  //       {this.renderErrors()}
  //     </Thumbnail>,
  //   ]);
  // }
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
