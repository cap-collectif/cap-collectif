// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import CloseButton from '~/components/Form/CloseButton';
import SubmitButton from '~/components/Form/SubmitButton';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import { TYPE_ALERT, UPDATE_ALERT } from '~/constants/AlertConstants';
import DeleteEmailingCampaignMutation from '~/mutations/DeleteEmailingCampaignMutation';
import type { DashboardParameters } from '~/components/Admin/Emailing/EmailingCampaign/DashboardCampaign/DashboardCampaign.reducer';
import { useDashboardCampaignContext } from '~/components/Admin/Emailing/EmailingCampaign/DashboardCampaign/DashboardCampaign.context';

type Props = {|
  show: boolean,
  onClose: () => void,
  campaignsIds: string[],
|};

const deleteCampaign = (
  campaignsIds: string[],
  onClose: () => void,
  parameters: DashboardParameters,
) => {
  return DeleteEmailingCampaignMutation.commit({
    input: {
      ids: campaignsIds,
    },
    parametersConnection: parameters,
  })
    .then(response => {
      if (response.deleteEmailingCampaigns?.error) {
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
            num: campaignsIds.length,
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

const ModalConfirmDelete = ({ show, onClose, campaignsIds }: Props) => {
  const { parameters } = useDashboardCampaignContext();

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
            id="title-delete-campaign-confirmation"
            values={{ num: campaignsIds.length }}
          />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormattedMessage id="delete-campaign-confirmation" values={{ num: campaignsIds.length }} />
      </Modal.Body>
      <Modal.Footer>
        <CloseButton onClose={onClose} label="editor.undo" />
        <SubmitButton
          label="global.removeDefinitively"
          onSubmit={() => deleteCampaign(campaignsIds, onClose, parameters)}
          bsStyle="danger"
        />
      </Modal.Footer>
    </Modal>
  );
};

export default ModalConfirmDelete;
