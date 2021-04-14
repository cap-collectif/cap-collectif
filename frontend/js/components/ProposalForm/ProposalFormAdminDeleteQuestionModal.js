// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';

type Props = {
  isShow: boolean,
  deleteType: string,
  level: ?number,
  cancelAction: () => void,
  deleteAction: () => void,
};

export const ProposalFormAdminDeleteQuestionModal = (props: Props) => {
  const { isShow, cancelAction, deleteAction, deleteType, level } = props;

  const titleId = (() => {
    if (deleteType === 'section') {
      if (level === 1) {
        return 'delete-sub-section-alert';
      }
      return 'delete-section-alert';
    }
    return 'question.alert.delete';
  })();

  return (
    <Modal
      show={isShow}
      onHide={cancelAction}
      aria-labelledby="proposal-form-admin-question-modal-title-lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage id={titleId} />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormattedMessage id="group-admin-parameters-modal-delete-content" />
      </Modal.Body>
      <Modal.Footer>
        <CloseButton onClose={cancelAction} />
        <SubmitButton
          id="js-delete-question"
          label="global.removeDefinitively"
          bsStyle="danger"
          isSubmitting={false}
          onSubmit={deleteAction}
        />
      </Modal.Footer>
    </Modal>
  );
};
