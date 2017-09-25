import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
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
    user: PropTypes.object,
  },

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
    const { isSubmitting, loginOverlay, onSubmit, user } = this.props;
    if ((loginOverlay && !user) || isSubmitting) {
      return null;
    }
    onSubmit();
  },

  render() {
    const { loginOverlay, isSubmitting, bsStyle, className, id, label, style } = this.props;
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
          style={style}>
          {isSubmitting ? (
            <FormattedMessage id="global.loading" />
          ) : (
            <FormattedMessage id={label} />
          )}
        </Button>
      </LoginOverlay>
    );
  },
});

const mapStateToProps = state => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(SubmitButton);
