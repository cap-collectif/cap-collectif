import React from 'react';
import {Button} from 'react-bootstrap';
import {IntlMixin} from 'react-intl';
import LoginOverlay from '../Utils/LoginOverlay';

const SubmitButton = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    isSubmitting: React.PropTypes.bool.isRequired,
    label: React.PropTypes.string,
    bsStyle: React.PropTypes.string,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    disabled: React.PropTypes.bool,
    loginOverlay: React.PropTypes.bool,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      label: 'global.publish',
      bsStyle: 'primary',
      className: '',
      style: {},
      disabled: false,
      loginOverlay: false,
    };
  },

  render() {
    const disabled = this.props.isSubmitting || this.props.loginOverlay ? false : this.props.disabled;
    return (
      <LoginOverlay enabled={this.props.loginOverlay}>
        <Button
          id={this.props.id}
          disabled={disabled}
          onClick={!this.props.isSubmitting ? this.props.onSubmit : null}
          bsStyle={this.props.bsStyle}
          className={this.props.className}
          style={this.props.style}
        >
          {this.props.isSubmitting
            ? this.getIntlMessage('global.loading')
            : this.getIntlMessage(this.props.label)
          }
        </Button>
      </LoginOverlay>
    );
  },

});

export default SubmitButton;
