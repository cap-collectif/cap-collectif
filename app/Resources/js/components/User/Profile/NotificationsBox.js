/**
 * @flow
 */
import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import NotificationsForm from './NotificationsForm';

type Props = void;

export class NotificationsBox extends Component<Props> {
  render() {
    return (
      <Panel header={<FormattedMessage id="profile.account.notifications.title" />}>
        <NotificationsForm />
      </Panel>
    );
  }
}

export default connect()(NotificationsBox);
