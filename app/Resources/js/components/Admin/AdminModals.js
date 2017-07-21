// @flow
import React from 'react';
import { IntlMixin } from 'react-intl';
import AddRegistrationQuestionModal from './AddRegistrationQuestionModal';
import UpdateRegistrationQuestionModal from './UpdateRegistrationQuestionModal';

const AdminModals = React.createClass({
  mixins: [IntlMixin],

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
