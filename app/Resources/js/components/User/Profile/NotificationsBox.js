/**
 * @flow
 */
import React, { Component } from 'react';
import { Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import NotificationsForm from './NotificationsForm';

type DefaultProps = void;

type Props = {
  notificationsConfiguration: NotificationForm_configuration
};

type State = void;

export class NotificationsBox extends Component<Props, State> {
  static defaultProps: DefaultProps;

  render() {
    const footer = (
      <Button
        id="edit-account-profile-button"
        onClick={() => {
          console.log('click');
        }}
        // disabled={invalid || submitting}
        bsStyle="primary"
        className="col-sm-offset-4">
        <FormattedMessage id="global.save_modifications" />
      </Button>
    );
    return (
      <Panel header={<FormattedMessage id="profile.account.notifications.title" />} footer={footer}>
        <NotificationsForm />
      </Panel>
    );
  }

}

const mapStateToProps = (state: State) => ({
  user: state.user.user ? state.user.user : null,
});

export default connect(mapStateToProps)(NotificationsBox);
