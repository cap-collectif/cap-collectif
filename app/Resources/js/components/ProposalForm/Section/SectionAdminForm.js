// @flow
import * as React from 'react';
import { Field } from 'redux-form';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import component from '../../Form/Field';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';

type Props = {
  show: boolean,
  onClose: () => void,
  onSubmit: () => void,
  member: string,
  isCreating: boolean,
  formName: string,
};

const SectionAdminForm = (props: Props) => {
  const { show, onClose, member, onSubmit, isCreating } = props;

  return (
    <Modal show={show} aria-labelledby="proposal-form-admin-question-modal-title-lg">
      <Modal.Header>
        <Modal.Title
          id="proposal-form-admin-question-modal-title-lg"
          children={
            <FormattedMessage id={!isCreating ? 'question_modal.create.title' : 'modify-section'} />
          }
        />
      </Modal.Header>
      <Modal.Body>
        <Field
          id={`${member}.title`}
          name={`${member}.title`}
          type="text"
          label={<FormattedMessage id="admin.fields.group.title" />}
          component={component}
        />
        <Field
          id={`${member}.description`}
          name={`${member}.description`}
          type="editor"
          label={<FormattedMessage id="proposal.description" />}
          component={component}
        />
      </Modal.Body>
      <Modal.Footer>
        <CloseButton onClose={onClose} />
        <SubmitButton label="global.validate" isSubmitting={false} onSubmit={onSubmit} />
      </Modal.Footer>
    </Modal>
  );
};

export default SectionAdminForm;
