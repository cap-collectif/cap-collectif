import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import LoginOverlay from '../Utils/LoginOverlay';

const SubmitButton = React.createClass({
  displayName: 'SubmitButton',
  propTypes: {
    id: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    label: PropTypes.string,
    bsStyle: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    disabled: PropTypes.bool,
    loginOverlay: PropTypes.bool,
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
    const {
      isSubmitting,
      loginOverlay,
      onSubmit,
    } = this.props;
    if (loginOverlay || isSubmitting) {
      return null;
    }
    onSubmit();
  },

  render() {
    const {
      loginOverlay,
      isSubmitting,
      bsStyle,
      className,
      id,
      label,
      style,
    } = this.props;
    const disabled = isSubmitting || this.props.disabled;
    return (
      <LoginOverlay enabled={loginOverlay}>
        <Button
          id={id}
          type="submit"
          disabled={disabled}
          onClick={this.onClick}
          bsStyle={bsStyle}
          className={className}
          style={style}
        >
          {isSubmitting
            ? this.getIntlMessage('global.loading')
            : this.getIntlMessage(label)
          }
        </Button>
      </LoginOverlay>
    );
  },

});

export default SubmitButton;
