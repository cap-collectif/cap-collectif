// @flow
import React, { PropTypes, cloneElement } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import RegistrationModal from '../User/Registration/RegistrationModal';
import { showLoginModal } from '../../redux/modules/user';
import type { State, Dispatch } from '../../types';

export const LoginOverlay = React.createClass({
  displayName: 'LoginOverlay',
  propTypes: {
    user: PropTypes.object,
    children: PropTypes.element.isRequired,
    features: PropTypes.object.isRequired,
    enabled: PropTypes.bool,
    openLoginModal: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      user: null,
      enabled: true,
    };
  },

  getInitialState() {
    return {
      showRegistration: false,
    };
  },

  popover: null,

  handleRegistrationClick() {
    this.setState({ showRegistration: true });
  },

  handleRegistrationClose() {
    this.setState({ showRegistration: false });
  },

  // We add Popover if user is not connected
  render() {
    const { user, children, enabled, features, openLoginModal } = this.props;
    const { showRegistration } = this.state;

    if (!enabled || user) {
      return children;
    }

    const popover = showRegistration
      ? <span />
      : (<Popover ref={c => this.popover = c} id="login-popover" title={this.getIntlMessage('vote.popover.title')}>
        <p>{ this.getIntlMessage('vote.popover.body') }</p>
        {
          features.registration &&
            <p>
              <Button
                onClick={this.handleRegistrationClick}
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
      </Popover>)
    ;
    return (
     <span>
       <OverlayTrigger
         trigger="click"
         rootClose
         placement="top"
         overlay={popover}
       >
         { cloneElement(children, { onClick: null }) }
       </OverlayTrigger>
       <RegistrationModal
         show={showRegistration}
         onClose={this.handleRegistrationClose}
       />
     </span>
    );
  },

});

const mapStateToProps = (state: State) => ({
  features: state.default.features,
  user: state.user.user,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  openLoginModal: () => { dispatch(showLoginModal()); },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(LoginOverlay);
