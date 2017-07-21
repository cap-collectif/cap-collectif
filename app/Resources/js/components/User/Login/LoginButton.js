// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import LoginModal from './LoginModal';
import { showLoginModal } from '../../../redux/modules/user';
import type { Dispatch } from '../../../types';

export const LoginButton = React.createClass({
  propTypes: {
    bsStyle: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
  },

  getDefaultProps() {
    return {
      bsStyle: 'default',
      className: '',
      style: {},
    };
  },

  render() {
    const { onClick, style, bsStyle, className } = this.props;
    return (
      <span style={style}>
        <Button bsStyle={bsStyle} onClick={onClick} className={className}>
          {<FormattedMessage id="global.login" />}
        </Button>
        <LoginModal />
      </span>
    );
  },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onClick: () => {
    dispatch(showLoginModal());
  },
});
const connector = connect(null, mapDispatchToProps);
export default connector(LoginButton);
