// @flow
import React, { PropTypes, cloneElement } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { showLoginModal, showRegistrationModal } from '../../redux/modules/user';
import type { State, Dispatch } from '../../types';

export const LoginOverlay = React.createClass({
  displayName: 'LoginOverlay',
  propTypes: {
    user: PropTypes.object,
    children: PropTypes.element.isRequired,
    enabled: PropTypes.bool,
    isLoginOrRegistrationModalOpen: PropTypes.bool.isRequired,
    showRegistrationButton: PropTypes.bool.isRequired,
    openLoginModal: PropTypes.func.isRequired,
    openRegistrationModal: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

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
      openLoginModal,
    } = this.props;

    if (!enabled || user) {
      return children;
    }

    const popover = (
      <Popover id="login-popover" title={this.getIntlMessage('vote.popover.title')}>
        <p>{ this.getIntlMessage('vote.popover.body') }</p>
        {
          showRegistrationButton &&
            <p>
              <Button
                onClick={openRegistrationModal}
                className="center-block btn-block"
              >
                { this.getIntlMessage('global.registration') }
              </Button>
            </p>
        }
        <p>
          <Button
            onClick={openLoginModal}
            bsStyle="success"
            className="center-block btn-block"
          >
            { this.getIntlMessage('global.login') }
          </Button>
        </p>
      </Popover>
    );

    return (
     <span>
       <OverlayTrigger
         trigger="click"
         rootClose
         placement="top"
         overlay={isLoginOrRegistrationModalOpen ? <span /> : popover}
       >
         { cloneElement(children, { onClick: null }) }
       </OverlayTrigger>
     </span>
    );
  },

});

const mapStateToProps = (state: State) => ({
  user: state.user.user,
  showRegistrationButton: state.default.features.registration,
  isLoginOrRegistrationModalOpen: state.user.showLoginModal || state.user.showRegistrationModal,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  openLoginModal: () => { dispatch(showLoginModal()); },
  openRegistrationModal: () => { dispatch(showRegistrationModal()); },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(LoginOverlay);
