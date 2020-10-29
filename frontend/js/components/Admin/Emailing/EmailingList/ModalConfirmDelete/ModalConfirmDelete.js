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
import type { DashboardParameters } from '~/components/Admin/Emailing/EmailingList/DashboardMailingList/DashboardMailingList.reducer';
import { useDashboardMailingListContext } from '~/components/Admin/Emailing/EmailingList/DashboardMailingList/DashboardMailingList.context';

type Props = {|
  show: boolean,
  onClose: () => void,
|};

const deleteMailingList = (
  mailingListIds: string[],
  onClose: () => void,
  parameters: DashboardParameters,
) => {
  return DeleteMailingListMutation.commit({
    input: {
      ids: mailingListIds,
    },
    parametersConnection: parameters,
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
          type: TYPE_ALERT.SUCCESS,
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
  const { parameters } = useDashboardMailingListContext();

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
          onSubmit={() => deleteMailingList(mailingListSelected, onClose, parameters)}
          bsStyle="danger"
        />
      </Modal.Footer>
    </Modal>
  );
};

export default ModalConfirmDelete;
