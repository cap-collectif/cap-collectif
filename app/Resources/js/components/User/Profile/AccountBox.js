// @flow
import * as React from 'react';
import { Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { isInvalid } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import AccountForm from './AccountForm';
import ConfirmPasswordModal from '../ConfirmPasswordModal';
import DeleteAccountModal from '../DeleteAccountModal';
import { confirmPassword } from '../../../redux/modules/user';
import type { GlobalState, Dispatch } from '../../../types';
import type { AccountBox_viewer } from '~relay/AccountBox_viewer.graphql';

type Props = {
  viewer: AccountBox_viewer,
  dispatch: Dispatch,
  invalid: boolean,
  submitting: boolean,
};

type State = {
  showDeleteAccountModal: boolean,
};

export class AccountBox extends React.Component<Props, State> {
  state = { showDeleteAccountModal: false };

  render() {
    const { invalid, submitting, dispatch, viewer } = this.props;

    const footer = (
        <div className="pl-15">
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
            this.setState({ showDeleteAccountModal: true });
          }}
          style={{ marginLeft: 15 }}>
          <FormattedMessage id="delete-account" />
        </Button>
      </div>
    );

    return (
      <React.Fragment>
        <Panel>
          <Panel.Heading>
            <Panel.Title>
              <div className="panel-heading profile-header">
                <h1>
                  <FormattedMessage id="profile.account.title" />
                </h1>
              </div>
            </Panel.Title>
          </Panel.Heading>
          <Panel.Body>
            <h2 className="page-header">
              <FormattedMessage id="profile.account.title" />
            </h2>
            <AccountForm />
            {/* $FlowFixMe please use mapDispatchToProps */}
            <ConfirmPasswordModal />
          </Panel.Body>
          <Panel.Footer>{footer}</Panel.Footer>
        </Panel>
        {/* $FlowFixMe */}
        <DeleteAccountModal
          viewer={viewer}
          show={this.state.showDeleteAccountModal}
          handleClose={() => {
            this.setState({ showDeleteAccountModal: false });
          }}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  submitting: state.user.isSubmittingAccountForm,
  invalid: isInvalid('account')(state),
});

const container = connect(mapStateToProps)(AccountBox);

export default createFragmentContainer(container, {
  viewer: graphql`
    fragment AccountBox_viewer on User {
      ...DeleteAccountModal_viewer
    }
  `,
});
