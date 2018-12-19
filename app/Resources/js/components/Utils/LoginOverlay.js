// @flow
import React, { cloneElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { showRegistrationModal } from '../../redux/modules/user';
import type { State, Dispatch } from '../../types';
import LoginButton from '../User/Login/LoginButton';

type Props = {
  user?: ?Object,
  children: $FlowFixMe,
  enabled?: boolean,
  isLoginOrRegistrationModalOpen: boolean,
  showRegistrationButton: boolean,
  openRegistrationModal: Function,
  loginWithMonCompteParis?: boolean,
  loginWithOpenId?: boolean,
};

export class LoginOverlay extends React.Component<Props> {
  static displayName = 'LoginOverlay';

  static defaultProps = { user: null, enabled: true, loginWithMonCompteParis: false };

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
      loginWithOpenId,
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
          !loginWithMonCompteParis &&
          !loginWithOpenId && (
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
  }
}

const mapStateToProps = (state: State) => ({
  user: state.user.user,
  showRegistrationButton: state.default.features.registration,
  isLoginOrRegistrationModalOpen:
    state.user.showLoginModal || state.user.showRegistrationModal || false,
  loginWithMonCompteParis: state.default.features.login_paris,
  loginWithOpenId: state.default.features.login_openid,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  openRegistrationModal: () => {
    dispatch(showRegistrationModal());
  },
});

const connector = connect(
  mapStateToProps,
  mapDispatchToProps,
);
export default connector(LoginOverlay);
