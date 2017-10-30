// @flow
import React, { PropTypes } from 'react';
import { Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import NotificationsForm from './NotificationsForm';
import type { State } from '../../../types';

export const NotificationBox = React.createClass({
  propTypes: {
    user: PropTypes.object.isRequired,
  },

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
  },
});

const mapStateToProps = (state: State) => ({
  user: state.user.user,
});

export default connect(mapStateToProps)(NotificationBox);
