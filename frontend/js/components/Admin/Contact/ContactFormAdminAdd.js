// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import ContactFormAdminModal from './ContactFormAdminModal';

type Props = {||};

type State = {|
  showAddContactFormModal: boolean,
|};

export default class ContactFormAdminAdd extends React.Component<Props, State> {
  state = { showAddContactFormModal: false };

  closeAddModal = () => {
    this.setState({ showAddContactFormModal: false });
    window.location.reload();
  };

  openAddModal = () => {
    this.setState({ showAddContactFormModal: true });
  };

  render() {
    const { showAddContactFormModal } = this.state;
    return (
      <div>
        <ContactFormAdminModal onClose={this.closeAddModal} show={showAddContactFormModal} />
        <Button
          type="submit"
          id="openAddModalButton"
          bsStyle="default"
          className="mt-10"
          onClick={this.openAddModal}>
          <FormattedMessage id="global.add" />
        </Button>
      </div>
    );
  }
}
