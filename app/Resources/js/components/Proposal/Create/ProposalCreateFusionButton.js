// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { isSubmitting, isInvalid, isPristine, submit } from 'redux-form';
import { closeCreateFusionModal, openCreateFusionModal } from '../../../redux/modules/proposal';
import ProposalFusionForm, { formName } from '../Form/ProposalFusionForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import type { State, Dispatch } from '../../../types';

export type Props = {
  showModal: boolean,
  submitting: boolean,
  pristine: boolean,
  invalid: boolean,
  open: () => void,
  close: () => void,
  submitForm: () => void,
};

export class ProposalCreateFusionButton extends React.Component<Props> {
  render() {
    const { showModal, invalid, pristine, submitting, open, close, submitForm } = this.props;
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
              disabled={invalid || pristine}
              onSubmit={() => submitForm()}
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
  pristine: isPristine(formName)(state),
  invalid: isInvalid(formName)(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  close: () => {
    dispatch(closeCreateFusionModal());
  },
  open: () => {
    dispatch(openCreateFusionModal());
  },
  submitForm: () => {
    dispatch(submit(formName));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProposalCreateFusionButton);
