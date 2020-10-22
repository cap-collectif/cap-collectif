// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import CloseButton from '~/components/Form/CloseButton';
import SubmitButton from '~/components/Form/SubmitButton';
import DeleteMailingListMutation from '~/mutations/DeleteMailingListMutation';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import { TYPE_ALERT, UPDATE_ALERT } from '~/constants/AlertConstants';
import { usePickableList } from '~ui/List/PickableList';

type Props = {|
  show: boolean,
  onClose: () => void,
|};

const deleteMailingList = (mailingListIds: string[], onClose: () => void) => {
  return DeleteMailingListMutation.commit({
    input: {
      ids: mailingListIds,
    },
  })
    .then(response => {
      if (response.deleteMailingList?.error) {
        onClose();

        return FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: {
            type: TYPE_ALERT.ERROR,
            content: 'global.error.server.form',
          },
        });
      }

      onClose();
      return FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          type: TYPE_ALERT.ERROR,
          content: 'success-delete-mailing-list',
          values: {
            num: mailingListIds.length,
          },
        },
      });
    })
    .catch(() => {
      return FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          type: TYPE_ALERT.ERROR,
          content: 'global.error.server.form',
        },
      });
    });
};

const ModalConfirmDelete = ({ show, onClose }: Props) => {
  const { selectedRows: mailingListSelected } = usePickableList();

  return (
    <Modal
      animation={false}
      show={show}
      onHide={onClose}
      bsSize="large"
      aria-labelledby="modal-title">
      <Modal.Header closeButton>
        <Modal.Title id="modal-title">
          <FormattedMessage
            id="title-delete-mailing-list-confirmation"
            values={{ num: mailingListSelected.length }}
          />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormattedMessage
          id="delete-mailing-list-confirmation"
          values={{ num: mailingListSelected.length }}
        />
      </Modal.Body>
      <Modal.Footer>
        <CloseButton onClose={onClose} label="editor.undo" />
        <SubmitButton
          label="global.removeDefinitively"
          onSubmit={() => deleteMailingList(mailingListSelected, onClose)}
          bsStyle="danger"
        />
      </Modal.Footer>
    </Modal>
  );
};

export default ModalConfirmDelete;
