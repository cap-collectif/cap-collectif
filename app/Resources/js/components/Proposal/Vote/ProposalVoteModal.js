// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer, commitLocalUpdate } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import { Modal } from 'react-bootstrap';
import { submit } from 'redux-form';
import { connect, type MapStateToProps } from 'react-redux';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { closeVoteModal, vote } from '../../../redux/modules/proposal';
import ProposalsUserVotesTable from '../../Project/Votes/ProposalsUserVotesTable';
import environment from '../../../createRelayEnvironment';
import type { State, Dispatch } from '../../../types';
import UpdateProposalVotesMutation from '../../../mutations/UpdateProposalVotesMutation';
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
};
class ProposalVoteModal extends React.Component<Props> {
  componentDidUpdate(prevProps: Props) {
    if (!prevProps.showModal && this.props.showModal) {
      this.createTmpVote();
    } else if (!this.props.showModal) {
      this.deleteTmpVote();
    }
  }

  onSubmit = (values: { votes: Array<{ anonymous: boolean, id: string }> }) => {
    const { dispatch, step, proposal } = this.props;

    const tmpVote = values.votes.filter(v => v.id === null)[0];

    // First we add the vote, then we update/reorder
    return vote(dispatch, step.id, proposal.id, tmpVote.anonymous).then(data => {
      if (
        !data ||
        !data.addProposalVote ||
        typeof data.addProposalVote.vote === 'undefined' ||
        data.addProposalVote.vote === null
      ) {
        console.error(data);
        return;
      }
      tmpVote.id = data.addProposalVote.vote.id;
      return UpdateProposalVotesMutation.commit({
        input: {
          step: step.id,
          votes: values.votes,
        },
      });
    });
  };

  onHide = () => {
    this.props.dispatch(closeVoteModal());
  };

  createTmpVote = () => {
    commitLocalUpdate(environment, store => {
      const dataID = `client:newTmpVote:${this.props.proposal.id}`;

      let newNode = store.get(dataID);
      if (!newNode) {
        newNode = store.create(dataID, 'ProposalVote');
      }
      newNode.setValue(false, 'anonymous');
      newNode.setValue(null, 'id'); // This will be used to know that this is the tmp vote
      newNode.setLinkedRecord(store.get(this.props.proposal.id), 'proposal');

      // Create a new edge
      const edgeID = `client:newTmpEdge:${this.props.proposal.id}`;
      let newEdge = store.get(edgeID);
      if (!newEdge) {
        newEdge = store.create(edgeID, 'ProposalVoteEdge');
      }
      newEdge.setLinkedRecord(newNode, 'node');

      const stepProxy = store.get(this.props.step.id);
      const connection = stepProxy.getLinkedRecord('viewerVotes', {
        orderBy: { field: 'POSITION', direction: 'ASC' },
      });
      ConnectionHandler.insertEdgeAfter(connection, newEdge);
    });
  };

  deleteTmpVote = () => {
    commitLocalUpdate(environment, store => {
      const dataID = `client:newTmpVote:${this.props.proposal.id}`;
      const stepProxy = store.get(this.props.step.id);
      const connection = stepProxy.getLinkedRecord('viewerVotes', {
        orderBy: { field: 'POSITION', direction: 'ASC' },
      });
      ConnectionHandler.deleteNode(connection, dataID);
      store.delete(dataID);
    });
  };

  render() {
    const { dispatch, showModal, proposal, step, isSubmitting } = this.props;
    return (
      <Modal
        animation={false}
        show={showModal}
        onHide={this.onHide}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage id="proposal.vote.modal.title" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProposalsUserVotesTable onSubmit={this.onSubmit} step={step} votes={step.viewerVotes} />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton className="pull-right" onClose={this.onHide} />
          <SubmitButton
            id="confirm-proposal-vote"
            onSubmit={() => {
              dispatch(submit(`proposal-user-vote-form-step-${step.id}`));
            }}
            label="proposal.vote.confirm"
            isSubmitting={isSubmitting}
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
    fragment ProposalVoteModal_step on ProposalStep {
      id
      ...ProposalsUserVotesTable_step
      viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
        ...ProposalsUserVotesTable_votes
        edges {
          node {
            id
          }
        }
      }
    }
  `,
});
