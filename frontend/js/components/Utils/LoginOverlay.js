// @flow
import React, { cloneElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button, OverlayTrigger } from 'react-bootstrap';
import { useAnalytics } from 'use-analytics';
import { showRegistrationModal } from '~/redux/modules/user';
import type { Dispatch, State } from '~/types';
import LoginButton from '../User/Login/LoginButton';
import Popover from './Popover';
import { loginWithOpenID } from '~/redux/modules/default';

export type Placement = 'top' | 'bottom' | 'left' | 'right';

type OwnProps = {|
  +children: $FlowFixMe,
  // DefaultProps not working right now
  +enabled?: boolean,
  +placement?: Placement,
|};

type StateProps = {|
  +user?: ?Object,
  +isLoginOrRegistrationModalOpen: boolean,
  +showRegistrationButton: boolean,
  +loginWithMonCompteParis?: boolean,
  +loginWithOpenId?: boolean,
|};

type Props = {|
  ...OwnProps,
  ...StateProps,
  +dispatch: Dispatch,
|};

export const LoginOverlay = ({
  user = null,
  children,
  enabled = true,
  showRegistrationButton,
  isLoginOrRegistrationModalOpen = false,
  loginWithMonCompteParis = false,
  loginWithOpenId = false,
  placement = 'top',
  dispatch,
}: Props) => {
  const { track } = useAnalytics();

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
          <Button
            onClick={() => {
              track('overlay_registration_click');
              dispatch(showRegistrationModal());
            }}
            className="center-block btn-block">
            <FormattedMessage id="global.registration" />
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
};
LoginOverlay.displayName = 'LoginOverlay';

const mapStateToProps = (state: State) => ({
  user: state.user.user,
  showRegistrationButton: state.default.features.registration || false,
  isLoginOrRegistrationModalOpen:
    state.user.showLoginModal || state.user.showRegistrationModal || false,
  loginWithMonCompteParis: state.default.features.login_paris || false,
  loginWithOpenId: loginWithOpenID(state.default.ssoList),
});

export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps)(LoginOverlay);
