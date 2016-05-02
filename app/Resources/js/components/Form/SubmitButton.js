import React from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import LoginOverlay from '../Utils/LoginOverlay';
import LoginStore from '../../stores/LoginStore';

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

  onClick() {
    if ((!LoginStore.isLoggedIn() && this.props.loginOverlay) || this.props.isSubmitting) {
      return;
    }
    this.props.onSubmit();
  },

  render() {
    const disabled = this.props.isSubmitting || this.props.disabled;
    return (
      <LoginOverlay enabled={this.props.loginOverlay}>
        <Button
          id={this.props.id}
          disabled={disabled}
          onClick={this.onClick}
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
