// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { isSubmitting, submit } from 'redux-form';
import { closeCreateFusionModal, openCreateFusionModal } from '../../../redux/modules/proposal';
import ProposalFusionForm, { formName } from '../Form/ProposalFusionForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import type { State, Dispatch } from '../../../types';

type Props = {
  showModal: boolean,
  submitting: boolean,
  open: () => void,
  close: () => void,
  dispatch: Dispatch,
};

export class ProposalCreateFusionButton extends React.Component<Props> {
  render() {
    const { showModal, submitting, open, close, dispatch } = this.props;
    return (
      <div>
        <Button
          id="add-proposal-fusion"
          bsStyle="default"
          style={{ marginTop: 10 }}
          onClick={() => open()}>
          <FormattedMessage id="proposal.add_fusion" />
        </Button>
        <Modal
          animation={false}
          show={showModal}
          onHide={() => close()}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              <FormattedMessage id="proposal.add_fusion" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ProposalFusionForm />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={() => close()} />
            <SubmitButton
              id="confirm-proposal-merge-create"
              label="create-a-new-proposal"
              isSubmitting={submitting}
              onSubmit={() => {
                dispatch(submit(formName));
              }}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  showModal: state.proposal.isCreatingFusion,
  submitting: isSubmitting(formName)(state),
});

export default connect(mapStateToProps, {
  close: closeCreateFusionModal,
  open: openCreateFusionModal,
})(ProposalCreateFusionButton);
