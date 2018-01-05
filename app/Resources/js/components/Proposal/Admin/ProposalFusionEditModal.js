// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { isSubmitting, isInvalid, isPristine, submit } from 'redux-form';
import ProposalFusionEditForm, { formName } from './ProposalFusionEditForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import type { State, Dispatch } from '../../../types';

type Props = {
  proposal: Object,
  show: boolean,
  submitting: boolean,
  pristine: boolean,
  invalid: boolean,
  open: () => void,
  onClose: () => void,
  submitForm: () => void,
};

export class ProposalFusionEditModal extends React.Component<Props> {
  render() {
    const { proposal, show, invalid, pristine, submitting, onClose, submitForm } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={() => onClose()}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage id="proposal.add_fusion" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProposalFusionEditForm proposal={proposal} />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={() => onClose()} />
          <SubmitButton
            id="confirm-proposal-merge-update"
            label="global.save"
            isSubmitting={submitting}
            disabled={invalid || pristine}
            onSubmit={() => submitForm()}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state: State) => ({
  submitting: isSubmitting(formName)(state),
  pristine: isPristine(formName)(state),
  invalid: isInvalid(formName)(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  submitForm: () => {
    dispatch(submit(formName));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ProposalFusionEditModal);
