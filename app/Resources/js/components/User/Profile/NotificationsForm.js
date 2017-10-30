// @flow
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import type { State } from '../../../types';

export const form = 'notifications';

export const NotificationsForm = React.createClass({
  propTypes: {
    newEmailToConfirm: PropTypes.string,
    error: PropTypes.string,
    initialValues: PropTypes.object.isRequired,
    confirmationEmailResent: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  },

  render() {
    return (
      <form
        onSubmit={() => {
          console.log('submit called');
        }}
        className="form-horizontal">
        <h1>Jsuis le form des notifs</h1>
      </form>
    );
  },
});

const mapStateToProps = (state: State) => ({
  newEmailToConfirm: state.user.user && state.user.user.newEmailToConfirm,
  confirmationEmailResent: state.user.confirmationEmailResent,
  initialValues: {
    email: state.user.user && state.user.user.email,
  },
});

export default connect(mapStateToProps)(
  reduxForm({
    form,
  })(NotificationsForm),
);
