// @flow
import React, { Component } from 'react';
import { Panel, Button } from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import { isInvalid } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import AccountForm from './AccountForm';
import ConfirmPasswordModal from '../ConfirmPasswordModal';
import { confirmPassword } from '../../../redux/modules/user';
import type { Dispatch, State } from '../../../types';

type Props = {
  user: Object,
  submitting: boolean,
  invalid: boolean,
  dispatch: Dispatch,
};

export class AccountBox extends Component<Props> {
  render() {
    const { invalid, submitting, dispatch } = this.props;
    const footer = (
      <Button
        id="edit-account-profile-button"
        onClick={() => dispatch(confirmPassword())}
        disabled={invalid || submitting}
        bsStyle="primary"
        className="col-sm-offset-4">
        {submitting ? (
          <FormattedMessage id="global.loading" />
        ) : (
          <FormattedMessage id="global.save_modifications" />
        )}
      </Button>
    );
    return (
      <Panel header={<FormattedMessage id="profile.account.title" />} footer={footer}>
        <AccountForm />
        <ConfirmPasswordModal />
      </Panel>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  user: state.user.user,
  submitting: state.user.isSubmittingAccountForm,
  invalid: isInvalid('account')(state),
});

export default connect(mapStateToProps)(AccountBox);
