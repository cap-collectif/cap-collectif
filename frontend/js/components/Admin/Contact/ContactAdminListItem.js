// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql, type RelayFragmentContainer } from 'react-relay';
import { Button, Row, Col, ListGroupItem, ButtonToolbar } from 'react-bootstrap';

import Translation from '~/services/Translation';
import AppDispatcher from '~/dispatchers/AppDispatcher';
import DeleteModal from '~/components/Modal/DeleteModal';
import ContactFormAdminModal from './ContactFormAdminModal';
import RemoveContactFormMutation from '~/mutations/RemoveContactFormMutation';
import type { ContactAdminListItem_contactForm } from '~relay/ContactAdminListItem_contactForm.graphql';

type Props = {|
  +contactForm: ContactAdminListItem_contactForm,
|};

type State = {|
  +showRemoveContactFormModal: boolean,
  +showEditContactFormModal: boolean,
|};

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
  state: State = {
    showRemoveContactFormModal: false,
    showEditContactFormModal: false,
  };

  render(): React.Node {
    const { contactForm } = this.props;
    const { showRemoveContactFormModal, showEditContactFormModal } = this.state;
    return (
      <ListGroupItem>
        <DeleteModal
          closeDeleteModal={() => {
            this.setState({ showRemoveContactFormModal: false });
          }}
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
          onClose={() => {
            this.setState({ showEditContactFormModal: false });
          }}
          show={showEditContactFormModal}
        />
        <Row>
          <Col xs={6}>
            <h4>
              <Translation
                field="title"
                translations={contactForm.translations}
                fallback="translation-not-available"
              />
            </h4>
          </Col>
          <Col xs={6}>
            <ButtonToolbar className="pull-right">
              <Button
                id={`UpdateContact-${contactForm.id}`}
                className="mt-5"
                bsStyle="warning"
                onClick={() => {
                  this.setState({ showEditContactFormModal: true });
                }}>
                <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
              </Button>
              <Button
                id={`DeleteContact-${contactForm.id}`}
                className="mt-5"
                bsStyle="danger"
                onClick={() => {
                  this.setState({ showRemoveContactFormModal: true });
                }}>
                <i className="fa fa-trash" /> <FormattedMessage id="global.delete" />
              </Button>
            </ButtonToolbar>
          </Col>
        </Row>
      </ListGroupItem>
    );
  }
}

export default (createFragmentContainer(ContactAdminListItem, {
  contactForm: graphql`
    fragment ContactAdminListItem_contactForm on ContactForm {
      id
      title
      translations {
        # eslint-disable-next-line relay/unused-fields
        locale
        title
      }
      ...ContactFormAdminModal_contactForm
    }
  `,
}): RelayFragmentContainer<typeof ContactAdminListItem>);
