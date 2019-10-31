// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { baseUrl } from '../../../config';
import { showLoginModal } from '../../../redux/modules/user';
import type { State } from '../../../types';
import { loginWithOpenID as isLoginWithOpenID } from '../../../redux/modules/default';

type Action = typeof showLoginModal;

type StateProps = {|
  loginWithMonCompteParis: boolean,
  loginWithOpenID: boolean,
  byPassLoginModal: boolean,
  disconnectOpenID: boolean,
  openLoginModal: typeof showLoginModal,
|};

type Props = {|
  ...StateProps,
  // default props not working
  bsStyle?: string,
  className?: ?string,
  style?: ?Object,
|};

export const LoginButton = (props: Props) => {
  const intl = useIntl();

  const {
    openLoginModal,
    loginWithMonCompteParis,
    byPassLoginModal,
    loginWithOpenID,
    disconnectOpenID,
    style,
    bsStyle,
    className,
  } = props;

  return (
    <span style={style}>
      <Button
        bsStyle={bsStyle}
        aria-label={intl.formatMessage({ id: 'open.connection_modal' })}
        onClick={() => {
          if (loginWithMonCompteParis) {
            const monCompteBaseUrl = 'https://moncompte.paris.fr/moncompte/';
            const backUrl = `${baseUrl}/login-paris?_destination=${window.location.href}`;
            const wH = 600;
            const wW = $(window).innerWidth() < 768 ? $(window).innerWidth() : 800;
            window.open(
              `${monCompteBaseUrl}jsp/site/Portal.jsp?page=myluteceusergu&view=createAccountModal&back_url=${backUrl}`,
              '_blank',
              `width=${wW},height=${wH},scrollbars=yes,status=yes,resizable=yes,toolbar=0,menubar=0,location=0,screenx=0,screeny=0`,
            );
          } else if (loginWithOpenID && byPassLoginModal) {
            const redirectUri = disconnectOpenID
              ? `${baseUrl}/sso/switch-user`
              : `${window && window.location.href}`;
            window.location.href = `/login/openid?_destination=${redirectUri}`;
          } else {
            openLoginModal();
          }
        }}
        className={className}>
        <FormattedMessage id="global.login" />
      </Button>
    </span>
  );
};

LoginButton.defaultProps = {
  bsStyle: 'default',
  className: '',
  style: {},
};

const mapStateToProps = state => ({
  loginWithMonCompteParis: state.default.features.login_paris || false,
  loginWithOpenID: isLoginWithOpenID(state.default.ssoList),
  byPassLoginModal: state.default.features.sso_by_pass_auth || false,
  disconnectOpenID: state.default.features.disconnect_openid || false,
});

const mapDispatchToProps = dispatch => ({
  openLoginModal: () => dispatch(showLoginModal()),
});

export default connect<Props, State, Action, _, _>(
  mapStateToProps,
  mapDispatchToProps,
)(LoginButton);
