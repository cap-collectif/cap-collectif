// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer, commitLocalUpdate } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import { Modal, Panel, Label } from 'react-bootstrap';
import { submit, isInvalid } from 'redux-form';
import { connect, type MapStateToProps } from 'react-redux';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { closeVoteModal, vote } from '../../../redux/modules/proposal';
import ProposalsUserVotesTable from '../../Project/Votes/ProposalsUserVotesTable';
import environment from '../../../createRelayEnvironment';
import type { State, Dispatch } from '../../../types';
import RequirementsForm, { formName } from '../../Requirements/RequirementsForm';
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
  invalid: boolean,
};
class ProposalVoteModal extends React.Component<Props> {
  componentDidUpdate(prevProps: Props) {
    if (!prevProps.showModal && this.props.showModal) {
      this.createTmpVote();
    } else if (!this.props.showModal && prevProps.showModal) {
      this.deleteTmpVote();
    }
  }

  onSubmit = (values: { votes: Array<{ public: boolean, id: string }> }) => {
    const { dispatch, step, proposal } = this.props;

    const tmpVote = values.votes.filter(v => v.id === null)[0];

    // First we add the vote, then we update/reorder
    return vote(dispatch, step.id, proposal.id, !tmpVote.public).then(data => {
      if (
        !data ||
        !data.addProposalVote ||
        typeof data.addProposalVote.vote === 'undefined' ||
        data.addProposalVote.vote === null
      ) {
        console.error(data); // eslint-disable-line no-console
        return;
      }
      tmpVote.id = data.addProposalVote.vote.id;
      return UpdateProposalVotesMutation.commit({
        input: {
          step: step.id,
          votes: values.votes.map(v => ({ id: v.id, anonymous: !v.public })),
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
      connection.setValue(connection.getValue('totalCount') + 1, 'totalCount');
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
      connection.setValue(connection.getValue('totalCount') - 1, 'totalCount');
      store.delete(dataID);
    });
  };

  render() {
    const { dispatch, showModal, proposal, step, invalid, isSubmitting } = this.props;
    return (
      <Modal
        animation={false}
        show={showModal}
        onHide={this.onHide}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage
              id={step.votesRanking ? 'vote-modal-title' : 'proposal.vote.modal.title'}
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {step.requirements.totalCount > 0 && (
            <Panel
              id="required-conditions"
              header={
                <span>
                  Conditions requises{' '}
                  {step.requirements.viewerMeetsTheRequirements && (
                    <Label>
                      <FormattedMessage id="filled" />
                    </Label>
                  )}
                </span>
              }
              collapsible
              defaultExpanded={!step.requirements.viewerMeetsTheRequirements}>
              {step.requirements.reason}
              <RequirementsForm step={step} />
            </Panel>
          )}
          <h3 className="d-ib mr-10 mb-10">
            <FormattedMessage
              id={step.votesRanking ? 'modal-ranking' : 'proposal.vote.modal.title'}
            />
          </h3>
          <h4 className="excerpt d-ib mt-15">
            <FormattedMessage
              id="project.votes.nb"
              values={{
                num: step.viewerVotes.totalCount,
              }}
            />
          </h4>
          <ProposalsUserVotesTable onSubmit={this.onSubmit} step={step} votes={step.viewerVotes} />
          {step.votesHelpText && (
            <div className="well mb-0 mt-15">
              <p>
                <b>
                  <FormattedMessage id="admin.fields.step.votesHelpText" />
                </b>
              </p>
              <div dangerouslySetInnerHTML={{ __html: step.votesHelpText }} />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <CloseButton className="pull-right" onClose={this.onHide} />
          <SubmitButton
            id="confirm-proposal-vote"
            disabled={step.requirements.totalCount > 0 ? invalid : false}
            onSubmit={() => {
              dispatch(submit(`proposal-user-vote-form-step-${step.id}`));
            }}
            label="global.validate"
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
    invalid: isInvalid(formName)(state),
  };
};

const container = connect(mapStateToProps)(ProposalVoteModal);

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalVoteModal_proposal on Proposal
      @argumentDefinitions(stepId: { type: "ID!", nonNull: true }) {
      id
      viewerHasVote(step: $stepId)
    }
  `,
  step: graphql`
    fragment ProposalVoteModal_step on ProposalStep {
      id
      votesRanking
      votesHelpText
      requirements {
        viewerMeetsTheRequirements
        reason
        totalCount
      }
      ...RequirementsForm_step
      ...ProposalsUserVotesTable_step
      viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
        ...ProposalsUserVotesTable_votes
        totalCount
        edges {
          node {
            id
          }
        }
      }
    }
  `,
});
