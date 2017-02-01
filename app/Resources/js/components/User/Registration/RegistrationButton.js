import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import RegistrationModal from './RegistrationModal';

export const RegistrationButton = React.createClass({
  propTypes: {
    features: PropTypes.object.isRequired,
    style: PropTypes.object,
    user: PropTypes.object,
    className: PropTypes.string,
    bsStyle: PropTypes.string,
    buttonStyle: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      style: {},
      buttonStyle: {},
      user: null,
      className: '',
      bsStyle: 'primary',
    };
  },

  getInitialState() {
    return {
      show: false,
    };
  },

  handleClick() {
    this.setState({ show: true });
  },

  handleClose() {
    this.setState({ show: false });
  },

  render() {
    const {
      bsStyle,
      buttonStyle,
      className,
      features,
      style,
      user,
    } = this.props;
    if (!features.registration || !!user) {
      return null;
    }
    return (
      <span style={style}>
        <Button
          style={buttonStyle}
          onClick={this.handleClick}
          bsStyle={bsStyle}
          className={`navbar-btn btn--registration ${className}`}
        >
          { this.getIntlMessage('global.registration') }
        </Button>
        <RegistrationModal
          show={this.state.show}
          onClose={this.handleClose}
        />
      </span>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    features: state.default.features,
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(RegistrationButton);
