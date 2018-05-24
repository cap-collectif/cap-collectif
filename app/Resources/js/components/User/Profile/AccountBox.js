// @flow
import React, { Component } from 'react';
import { Panel, Button } from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import { isInvalid } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import AccountForm from './AccountForm';
import ConfirmPasswordModal from '../ConfirmPasswordModal';
import DeleteAccountModal from '../DeleteAccountModal';
import { confirmPassword, showDeleteAccountModal } from '../../../redux/modules/user';
import type { State, Dispatch } from '../../../types';
import type { AccountBox_viewer } from './__generated__/AccountBox_viewer.graphql';

type Props = {
  viewer: AccountBox_viewer,
  dispatch: Dispatch,
  invalid: boolean,
  submitting: boolean,
};

export class AccountBox extends Component<Props, State> {
  render() {
    const { invalid, submitting, dispatch, viewer } = this.props;
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
            className="col-sm-offset-5">
            {submitting ? (
              <FormattedMessage id="global.loading" />
            ) : (
              <FormattedMessage id="global.save_modifications" />
            )}
          </Button>
          <Button
            id="delete-account-profile-button"
            bsStyle="danger"
            onClick={() => {
              dispatch(showDeleteAccountModal());
            }}
            style={{ marginLeft: 15 }}>
            <FormattedMessage id="delete-account" />
          </Button>
        </div>
        <DeleteAccountModal viewer={viewer} />
      </Panel>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  submitting: state.user.isSubmittingAccountForm,
  invalid: isInvalid('account')(state),
});

const container = connect(mapStateToProps)(AccountBox);

export default createFragmentContainer(
  container,
  graphql`
    fragment AccountBox_viewer on User {
      ...DeleteAccountModal_viewer
    }
  `,
);
