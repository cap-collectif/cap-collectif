// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button, Row, Col, ListGroupItem, ButtonToolbar } from 'react-bootstrap';

import DeleteModal from '../../Modal/DeleteModal';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import ContactFormAdminModal from './ContactFormAdminModal';
import RemoveContactFormMutation from '../../../mutations/RemoveContactFormMutation';
import type { ContactAdminListItem_contactForm } from '~relay/ContactAdminListItem_contactForm.graphql';

type Props = {|
  contactForm: ContactAdminListItem_contactForm,
|};

type State = {
  showRemoveContactFormModal: boolean,
  showEditContactFormModal: boolean,
};

const onDelete = (id: string) => {
  RemoveContactFormMutation.commit({ input: { id } });
  AppDispatcher.dispatch({
    actionType: 'UPDATE_ALERT',
    alert: {
      bsStyle: 'success',
      content: 'your-form-has-been-deleted',
    },
  });
};

export class ContactAdminListItem extends React.Component<Props, State> {
  state = {
    showRemoveContactFormModal: false,
    showEditContactFormModal: false,
  };

  closeRemoveModal = () => {
    this.setState({ showRemoveContactFormModal: false });
  };

  closeEditModal = () => {
    this.setState({ showEditContactFormModal: false });
  };

  openRemoveModal = () => {
    this.setState({ showRemoveContactFormModal: true });
  };

  openEditModal = () => {
    this.setState({ showEditContactFormModal: true });
  };

  render() {
    const { contactForm } = this.props;
    const { showRemoveContactFormModal, showEditContactFormModal } = this.state;
    return (
      <ListGroupItem>
        <DeleteModal
          closeDeleteModal={this.closeRemoveModal}
          showDeleteModal={showRemoveContactFormModal}
          deleteElement={() => {
            onDelete(contactForm.id);
            window.location.reload();
          }}
          deleteModalTitle="group.admin.contactForm.modal.delete.content"
          deleteModalContent="group-admin-parameters-modal-delete-content"
        />
        <ContactFormAdminModal
          contactForm={contactForm}
          onClose={this.closeEditModal}
          show={showEditContactFormModal}
        />
        <Row>
          <Col xs={6}>
            <h4>{contactForm.title}</h4>
          </Col>
          <Col xs={6}>
            <ButtonToolbar className="pull-right">
              <Button
                id={`UpdateContact-${contactForm.id}`}
                className="mt-5"
                bsStyle="warning"
                onClick={this.openEditModal}>
                <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
              </Button>
              <Button
                id={`DeleteContact-${contactForm.id}`}
                className="mt-5"
                bsStyle="danger"
                onClick={this.openRemoveModal}>
                <i className="fa fa-trash" /> <FormattedMessage id="global.delete" />
              </Button>
            </ButtonToolbar>
          </Col>
        </Row>
      </ListGroupItem>
    );
  }
}

export default createFragmentContainer(ContactAdminListItem, {
  contactForm: graphql`
    fragment ContactAdminListItem_contactForm on ContactForm {
      id
      title
      ...ContactFormAdminModal_contactForm
    }
  `,
});
