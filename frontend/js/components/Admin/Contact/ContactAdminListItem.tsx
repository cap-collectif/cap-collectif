import * as React from 'react'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'
import type { RelayFragmentContainer } from 'react-relay'
import { createFragmentContainer, graphql } from 'react-relay'
import { Button, Row, Col, ListGroupItem, ButtonToolbar } from 'react-bootstrap'
import Translation from '~/services/Translation'
import DeleteModal from '~/components/Modal/DeleteModal'
import ContactFormAdminModal from './ContactFormAdminModal'
import RemoveContactFormMutation from '~/mutations/RemoveContactFormMutation'
import type { ContactAdminListItem_contactForm } from '~relay/ContactAdminListItem_contactForm.graphql'
import { toast } from '~ds/Toast'

type Props = {
  readonly contactForm: ContactAdminListItem_contactForm
}

const onDelete = (id: string, intl: IntlShape) => {
  RemoveContactFormMutation.commit({
    input: {
      id,
    },
  })
  toast({
    variant: 'success',
    content: intl.formatMessage({ id: 'your-form-has-been-deleted' }),
  })
}

export const ContactAdminListItem = ({ contactForm }: Props) => {
  const [showRemoveContactFormModal, setShowRemoveContactFormModal] = React.useState(false)
  const [showEditContactFormModal, setShowEditContactFormModal] = React.useState(false)
  const intl = useIntl()

  return (
    <ListGroupItem>
      <DeleteModal
        closeDeleteModal={() => setShowRemoveContactFormModal(false)}
        showDeleteModal={showRemoveContactFormModal}
        deleteElement={() => {
          onDelete(contactForm.id, intl)
          window.location.reload()
        }}
        deleteModalTitle="group.admin.contactForm.modal.delete.content"
        deleteModalContent="group-admin-parameters-modal-delete-content"
      />
      <ContactFormAdminModal
        contactForm={contactForm}
        onClose={() => setShowEditContactFormModal(false)}
        show={showEditContactFormModal}
      />
      <Row>
        <Col xs={6}>
          <h4>
            <Translation field="title" translations={contactForm.translations} fallback="translation-not-available" />
          </h4>
        </Col>
        <Col xs={6}>
          <ButtonToolbar className="pull-right">
            <Button
              id={`UpdateContact-${contactForm.id}`}
              className="mt-5"
              bsStyle="warning"
              onClick={() => setShowEditContactFormModal(true)}
            >
              <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
            </Button>
            <Button
              id={`DeleteContact-${contactForm.id}`}
              className="mt-5"
              bsStyle="danger"
              onClick={() => setShowRemoveContactFormModal(true)}
            >
              <i className="fa fa-trash" /> <FormattedMessage id="global.delete" />
            </Button>
          </ButtonToolbar>
        </Col>
      </Row>
    </ListGroupItem>
  )
}

export default createFragmentContainer(ContactAdminListItem, {
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
}) as RelayFragmentContainer<typeof ContactAdminListItem>
