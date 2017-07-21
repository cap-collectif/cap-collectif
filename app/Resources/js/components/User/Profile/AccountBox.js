// @flow
import React, { PropTypes } from 'react';
import { Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { isInvalid } from 'redux-form';
import { IntlMixin } from 'react-intl';
import AccountForm from './AccountForm';
import ConfirmPasswordModal from '../ConfirmPasswordModal';
import { confirmPassword } from '../../../redux/modules/user';
import type { State } from '../../../types';

export const AccountBox = React.createClass({
  propTypes: {
    user: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
    invalid: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { invalid, submitting, dispatch } = this.props;
    const footer = (
      <Button
        id="edit-account-profile-button"
        onClick={() => dispatch(confirmPassword())}
        disabled={invalid || submitting}
        bsStyle="primary"
        className="col-sm-offset-4"
      >
        {
          submitting
          ? this.getIntlMessage('global.loading')
          : this.getIntlMessage('global.save_modifications')
        }
      </Button>
    );
    return (
      <Panel
        header={this.getIntlMessage('profile.account.title')}
        footer={footer}
      >
        <AccountForm />
        <ConfirmPasswordModal />
      </Panel>
    );
  },

});

const mapStateToProps = (state: State) => ({
  user: state.user.user,
  submitting: state.user.isSubmittingAccountForm,
  invalid: isInvalid('account')(state),
});

export default connect(mapStateToProps)(AccountBox);
