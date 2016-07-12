import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import LoginOverlay from '../Utils/LoginOverlay';
import { connect } from 'react-redux';

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
    user: PropTypes.object,
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
      user: null,
    };
  },

  onClick() {
    if (this.props.loginOverlay || this.props.isSubmitting) {
      return null;
    }
    this.props.onSubmit();
  },

  render() {
    const { loginOverlay, isSubmitting } = this.props;
    const disabled = isSubmitting || this.props.disabled;
    return (
      <LoginOverlay enabled={loginOverlay}>
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

const mapStateToProps = (state) => {
  return {
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(SubmitButton);
