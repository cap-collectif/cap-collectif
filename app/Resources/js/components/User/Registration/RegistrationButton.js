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
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      style: {},
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
    if (!this.props.features.registration || !!this.props.user) {
      return null;
    }
    return (
      <span style={this.props.style}>
        <Button
          onClick={this.handleClick}
          bsStyle={this.props.bsStyle}
          className={'navbar-btn btn--registration ' + this.props.className}
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
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(RegistrationButton);
