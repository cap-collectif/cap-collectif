// @flow
import React, { cloneElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button, OverlayTrigger } from 'react-bootstrap';
import { showRegistrationModal } from '../../redux/modules/user';
import type { State } from '../../types';
import LoginButton from '../User/Login/LoginButton';
import Popover from './Popover';

type Action = {|
  type: 'SHOW_REGISTRATION_MODAL',
|};

export type Placement = 'top' | 'bottom' | 'left' | 'right';

type OwnProps = {|
  children: $FlowFixMe,
  // DefaultProps not working right now
  enabled?: boolean,
  placement?: Placement,
|};

type DispatchProps = {|
  openRegistrationModal: typeof showRegistrationModal,
|};

type StateProps = {|
  user: ?Object,
  isLoginOrRegistrationModalOpen: boolean,
  showRegistrationButton: boolean,
  loginWithMonCompteParis: boolean,
  loginWithOpenId: boolean,
|};

type Props = {|
  ...OwnProps,
  ...StateProps,
  ...DispatchProps,
|};

export class LoginOverlay extends React.Component<Props> {
  static displayName = 'LoginOverlay';

  static defaultProps = {
    user: null,
    enabled: true,
    isLoginOrRegistrationModalOpen: false,
    loginWithMonCompteParis: false,
    loginWithOpenId: false,
    placement: 'top',
  };

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
      placement,
    } = this.props;

    if (!enabled || user) {
      return children;
    }

    const popover = (
      <Popover id="login-popover" title={<FormattedMessage id="vote.popover.title" />}>
        <p>
          <FormattedMessage id="vote.popover.body" />
        </p>
        {showRegistrationButton && !loginWithMonCompteParis && !loginWithOpenId && (
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
          placement={placement}
          overlay={isLoginOrRegistrationModalOpen ? <span /> : popover}>
          {cloneElement(children, { onClick: null })}
        </OverlayTrigger>
      </span>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user.user,
  showRegistrationButton: state.default.features.registration || false,
  isLoginOrRegistrationModalOpen:
    state.user.showLoginModal || state.user.showRegistrationModal || false,
  loginWithMonCompteParis: state.default.features.login_paris || false,
  loginWithOpenId: state.default.features.login_openid || false,
});

const mapDispatchToProps = dispatch => ({
  openRegistrationModal: () => dispatch(showRegistrationModal()),
});

export default connect<Props, State, Action, _, _>(
  mapStateToProps,
  mapDispatchToProps,
)(LoginOverlay);
