// @flow
import * as React from 'react';
import AddRegistrationQuestionModal from './AddRegistrationQuestionModal';
import UpdateRegistrationQuestionModal from './UpdateRegistrationQuestionModal';

type Props = {};

class AdminModals extends React.Component<Props> {
  render() {
    return (
      <div>
        <AddRegistrationQuestionModal />
        <UpdateRegistrationQuestionModal />
      </div>
    );
  }
}

export default AdminModals;
