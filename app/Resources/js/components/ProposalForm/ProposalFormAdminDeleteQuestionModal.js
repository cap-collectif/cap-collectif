// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';

type Props = {
  isShow: boolean,
  cancelAction: Function,
  deleteAction: Function,
};

export const ProposalFormAdminDeleteQuestionModal = (props: Props) => {
  const { isShow, cancelAction, deleteAction } = props;

  return (
    <Modal
      show={isShow}
      onHide={cancelAction}
      aria-labelledby="proposal-form-admin-question-modal-title-lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage id={'delete-section-alert'} />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <i className="cap cap-alert-2" />
        <FormattedMessage id={'group-admin-parameters-modal-delete-content'} />
      </Modal.Body>
      <Modal.Footer>
        <CloseButton onClose={cancelAction} />
        <SubmitButton
          label="delete-definitively"
          bsStyle="danger"
          isSubmitting={false}
          onSubmit={deleteAction}
        />
      </Modal.Footer>
    </Modal>
  );
};
