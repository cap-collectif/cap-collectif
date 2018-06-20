// @flow
import * as React from 'react';
import AddRegistrationQuestionModal from './AddRegistrationQuestionModal';
import UpdateRegistrationQuestionModal from './UpdateRegistrationQuestionModal';

const AdminModals = React.createClass({
  render() {
    return (
      <div>
        <AddRegistrationQuestionModal />
        <UpdateRegistrationQuestionModal />
      </div>
    );
  },
});

export default AdminModals;
