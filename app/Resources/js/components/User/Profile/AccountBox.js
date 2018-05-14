// @flow
import React, { Component } from 'react';
import { Panel, Button } from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import { isInvalid } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import AccountForm from './AccountForm';
import ConfirmPasswordModal from '../ConfirmPasswordModal';
import { confirmPassword } from '../../../redux/modules/user';
import type { State, Dispatch } from '../../../types';

type Props = {
  dispatch: Dispatch,
  invalid: boolean,
  submitting: boolean,
};

export class AccountBox extends Component<Props> {
  render() {
    const { invalid, submitting, dispatch } = this.props;
    return (
      <Panel>
        <h2 className="page-header">
          <FormattedMessage id="profile.account.title" />
        </h2>
        <AccountForm />
        <ConfirmPasswordModal />
        <div style={{ paddingLeft: 15 }}>
          <Button
            id="edit-account-profile-button"
            onClick={() => dispatch(confirmPassword())}
            disabled={invalid || submitting}
            bsStyle="primary"
            className="col-sm-offset-3">
            {submitting ? (
              <FormattedMessage id="global.loading" />
            ) : (
              <FormattedMessage id="global.save_modifications" />
            )}
          </Button>
        </div>
      </Panel>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  submitting: state.user.isSubmittingAccountForm,
  invalid: isInvalid('account')(state),
});

export default connect(mapStateToProps)(AccountBox);
