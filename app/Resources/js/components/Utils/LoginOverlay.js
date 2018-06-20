// @flow
import React, { PropTypes, cloneElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { showRegistrationModal } from '../../redux/modules/user';
import type { State, Dispatch } from '../../types';
import LoginButton from '../User/Login/LoginButton';

export const LoginOverlay = React.createClass({
  displayName: 'LoginOverlay',

  propTypes: {
    user: PropTypes.object,
    children: PropTypes.element.isRequired,
    enabled: PropTypes.bool,
    isLoginOrRegistrationModalOpen: PropTypes.bool.isRequired,
    showRegistrationButton: PropTypes.bool.isRequired,
    openRegistrationModal: PropTypes.func.isRequired,
    loginWithMonCompteParis: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      user: null,
      enabled: true,
    };
  },

  // We add Popover if user is not connected
  render() {
    const {
      user,
      children,
      enabled,
      showRegistrationButton,
      isLoginOrRegistrationModalOpen,
      openRegistrationModal,
      loginWithMonCompteParis,
    } = this.props;

    if (!enabled || user) {
      return children;
    }

    const popover = (
      <Popover id="login-popover" title={<FormattedMessage id="vote.popover.title" />}>
        <p>
          <FormattedMessage id="vote.popover.body" />
        </p>
        {showRegistrationButton &&
          !loginWithMonCompteParis && (
            <p>
              <Button onClick={openRegistrationModal} className="center-block btn-block">
                {<FormattedMessage id="global.registration" />}
              </Button>
            </p>
          )}
        <p>
          <LoginButton bsStyle="success" className="center-block btn-block" />
        </p>
      </Popover>
    );

    return (
      <span>
        <OverlayTrigger
          trigger="click"
          rootClose
          placement="top"
          overlay={isLoginOrRegistrationModalOpen ? <span /> : popover}>
          {cloneElement(children, { onClick: null })}
        </OverlayTrigger>
      </span>
    );
  },
});

const mapStateToProps = (state: State) => ({
  user: state.user.user,
  showRegistrationButton: state.default.features.registration,
  isLoginOrRegistrationModalOpen:
    state.user.showLoginModal || state.user.showRegistrationModal || false,
  loginWithMonCompteParis: state.default.features.login_paris,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  openRegistrationModal: () => {
    dispatch(showRegistrationModal());
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(LoginOverlay);
