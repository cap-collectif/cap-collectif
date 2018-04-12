// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';
import { submit, isValid } from 'redux-form';
import { connect, type MapStateToProps } from 'react-redux';
import ProposalVoteBox from './ProposalVoteBox';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { closeVoteModal } from '../../../redux/modules/proposal';
import type { State, Dispatch } from '../../../types';

type ParentProps = {
  proposal: Object,
};

type Props = ParentProps & {
  step: ?Object,
  dispatch: Dispatch,
  showModal: boolean,
  isSubmitting: boolean,
  valid: boolean,
};
class ProposalVoteModal extends React.Component<Props> {
  render() {
    const { dispatch, showModal, proposal, step, isSubmitting, valid } = this.props;
    return (
      <Modal
        animation={false}
        show={showModal}
        onHide={() => {
          dispatch(closeVoteModal());
        }}
        bsSize="small"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage id="proposal.vote.modal.title" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProposalVoteBox proposal={proposal} step={step} />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            className="pull-right"
            onClose={() => {
              dispatch(closeVoteModal());
            }}
          />
          <SubmitButton
            id="confirm-proposal-vote"
            onSubmit={() => {
              dispatch(submit('proposalVote'));
            }}
            label="proposal.vote.confirm"
            isSubmitting={valid && isSubmitting}
            bsStyle={!proposal.userHasVote || isSubmitting ? 'success' : 'danger'}
            style={{ marginLeft: '10px' }}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: ParentProps) => {
  const steps = state.project.currentProjectById
    ? state.project.projectsById[state.project.currentProjectById].steps.filter(
        s => s.id === props.proposal.votableStepId,
      )
    : [];
  return {
    showModal: !!(
      state.proposal.currentVoteModal && state.proposal.currentVoteModal === props.proposal.id
    ),
    isSubmitting: !!state.proposal.isVoting,
    valid: isValid('proposalVote')(state),
    step: steps.length === 1 ? steps[0] : null,
  };
};

export default connect(mapStateToProps)(ProposalVoteModal);
