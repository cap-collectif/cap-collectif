// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import LoginModal from './LoginModal';
import { baseUrl } from '../../../config';
import { showLoginModal } from '../../../redux/modules/user';
import type { State } from '../../../types';

type Action = typeof showLoginModal;

type StateProps = {|
  loginWithMonCompteParis: boolean,
  loginWithOpenId: boolean,
  openLoginModal: typeof showLoginModal,
|};

type Props = {|
  ...StateProps,
  // default props not working
  bsStyle?: string,
  className?: ?string,
  style?: ?Object,
|};

export class LoginButton extends React.Component<Props> {
  static defaultProps = {
    bsStyle: 'default',
    className: '',
    style: {},
  };

  render() {
    const {
      openLoginModal,
      loginWithMonCompteParis,
      loginWithOpenId,
      style,
      bsStyle,
      className,
    } = this.props;

    return (
      <span style={style}>
        <Button
          bsStyle={bsStyle}
          aria-label="Ouvrir la modal de connexion"
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
            } else if (loginWithOpenId) {
              window.location.href = `/login/openid?_destination=${window && window.location.href}`;
            } else {
              openLoginModal();
            }
          }}
          className={className}>
          <FormattedMessage id="global.login" />
        </Button>
        <LoginModal />
      </span>
    );
  }
}

const mapStateToProps = state => ({
  loginWithMonCompteParis: state.default.features.login_paris,
  loginWithOpenId: state.default.features.login_openid,
});

const mapDispatchToProps = dispatch => ({
  openLoginModal: () => dispatch(showLoginModal()),
});

export default connect<Props, State, Action, _, _>(
  mapStateToProps,
  mapDispatchToProps,
)(LoginButton);
