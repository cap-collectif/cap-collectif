// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { Modal } from 'react-bootstrap';
import { submit, isValid } from 'redux-form';
import { connect, type MapStateToProps } from 'react-redux';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { closeVoteModal } from '../../../redux/modules/proposal';
import ProposalVoteForm from './ProposalVoteForm';
import type { State, Dispatch } from '../../../types';
import type { ProposalVoteModal_proposal } from './__generated__/ProposalVoteModal_proposal.graphql';
import type { ProposalVoteModal_step } from './__generated__/ProposalVoteModal_step.graphql';

type ParentProps = {
  proposal: ProposalVoteModal_proposal,
  step: ProposalVoteModal_step,
};

type Props = ParentProps & {
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
          <div id="proposal-vote-box">
            <ProposalVoteForm proposal={proposal} step={step} />
          </div>
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
            bsStyle={!proposal.viewerHasVote || isSubmitting ? 'success' : 'danger'}
            style={{ marginLeft: '10px' }}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: ParentProps) => {
  return {
    showModal: !!(
      state.proposal.currentVoteModal && state.proposal.currentVoteModal === props.proposal.id
    ),
    isSubmitting: !!state.proposal.isVoting,
    valid: isValid('proposalVote')(state),
  };
};

const container = connect(mapStateToProps)(ProposalVoteModal);

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalVoteModal_proposal on Proposal
      @argumentDefinitions(
        stepId: { type: "ID!", nonNull: true }
        isAuthenticated: { type: "Boolean!", nonNull: true }
      ) {
      id
      viewerHasVote(step: $stepId) @include(if: $isAuthenticated)
    }
  `,
  step: graphql`
    fragment ProposalVoteModal_step on Step {
      id
    }
  `,
});
