// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer, commitLocalUpdate } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import { Modal, Panel, Label } from 'react-bootstrap';
import { submit, isPristine, isInvalid } from 'redux-form';
import { connect } from 'react-redux';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { closeVoteModal, vote } from '../../../redux/modules/proposal';
import ProposalsUserVotesTable, { getFormName } from '../../Project/Votes/ProposalsUserVotesTable';
import environment from '../../../createRelayEnvironment';
import type { GlobalState, Dispatch } from '../../../types';
import RequirementsForm, { formName } from '../../Requirements/RequirementsForm';
import UpdateProposalVotesMutation from '../../../mutations/UpdateProposalVotesMutation';
import type { ProposalVoteModal_proposal } from './__generated__/ProposalVoteModal_proposal.graphql';
import type { ProposalVoteModal_step } from './__generated__/ProposalVoteModal_step.graphql';
import WYSIWYGRender from '../../Form/WYSIWYGRender';

type ParentProps = {
  proposal: ProposalVoteModal_proposal,
  step: ProposalVoteModal_step,
};

type Props = ParentProps & {
  dispatch: Dispatch,
  showModal: boolean,
  isSubmitting: boolean,
  invalid: boolean,
  pristine: boolean,
  viewerIsConfirmedByEmail: boolean,
  isAuthenticated: boolean,
};

type State = {
  keyboard: boolean,
};

export class ProposalVoteModal extends React.Component<Props, State> {
  state = {
    keyboard: true,
  };

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.showModal && this.props.showModal) {
      this.createTmpVote();
    } else if (!this.props.showModal && prevProps.showModal) {
      this.deleteTmpVote();
    }
  }

  onSubmit = (values: { votes: Array<{ public: boolean, id: string }> }) => {
    const { pristine, dispatch, step, proposal, isAuthenticated } = this.props;

    const tmpVote = values.votes.filter(v => v.id === null)[0];

    // First we add the vote
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

      // If the user didn't reorder
      // or update any vote privacy
      // we are clean
      if (!step.votesRanking && pristine) {
        return true;
      }

      // Otherwise we update/reorder votes
      return UpdateProposalVotesMutation.commit({
        input: {
          step: step.id,
          votes: values.votes.map(v => ({ id: v.id, anonymous: !v.public })),
          isAuthenticated,
        },
        isAuthenticated,
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
      newNode.setValue(this.props.viewerIsConfirmedByEmail, 'published');
      if (!this.props.viewerIsConfirmedByEmail) {
        newNode.setValue('WAITING_AUTHOR_CONFIRMATION', 'notPublishedReason');
      }
      newNode.setValue(false, 'anonymous');
      newNode.setValue(null, 'id'); // This will be used to know that this is the tmp vote

      // $FlowFixMe Cannot call newNode.setLinkedRecord with store.get(...) bound to record
      newNode.setLinkedRecord(store.get(this.props.proposal.id), 'proposal');

      // Create a new edge
      const edgeID = `client:newTmpEdge:${this.props.proposal.id}`;
      let newEdge = store.get(edgeID);
      if (!newEdge) {
        newEdge = store.create(edgeID, 'ProposalVoteEdge');
      }
      newEdge.setLinkedRecord(newNode, 'node');

      const stepProxy = store.get(this.props.step.id);
      if (!stepProxy) return;
      const connection = stepProxy.getLinkedRecord('viewerVotes', {
        orderBy: { field: 'POSITION', direction: 'ASC' },
      });
      if (!connection) {
        return;
      }
      ConnectionHandler.insertEdgeAfter(connection, newEdge);
      const totalCount = parseInt(connection.getValue('totalCount'), 10);
      connection.setValue(totalCount + 1, 'totalCount');
    });
  };

  deleteTmpVote = () => {
    commitLocalUpdate(environment, store => {
      const dataID = `client:newTmpVote:${this.props.proposal.id}`;
      const stepProxy = store.get(this.props.step.id);
      if (!stepProxy) return;
      const connection = stepProxy.getLinkedRecord('viewerVotes', {
        orderBy: { field: 'POSITION', direction: 'ASC' },
      });
      ConnectionHandler.deleteNode(connection, dataID);
      const totalCount = parseInt(connection.getValue('totalCount'), 10);
      connection.setValue(totalCount - 1, 'totalCount');
      store.delete(dataID);
    });
  };

  disabledKeyboard = () => {
    this.setState({
      keyboard: false,
    });
  };

  activeKeyboard = () => {
    this.setState({
      keyboard: true,
    });
  };

  render() {
    const { dispatch, showModal, proposal, step, invalid, isSubmitting } = this.props;
    const { keyboard } = this.state;

    const keyTradForModalVote =
      step.form && step.form.isProposalForm ? 'project.votes.nb' : 'count-questions';
    return step.requirements ? (
      <Modal
        animation={false}
        enforceFocus={false}
        keyboard={keyboard}
        show={showModal}
        onHide={this.onHide}
        bsSize="large"
        role="dialog"
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
            <Panel id="required-conditions" bsStyle="primary">
              <Panel.Heading>
                <FormattedMessage id="requirements" />{' '}
                {step.requirements.viewerMeetsTheRequirements && (
                  <Label bsStyle="primary">
                    <FormattedMessage id="filled" />
                  </Label>
                )}
              </Panel.Heading>
              {!step.requirements.viewerMeetsTheRequirements && (
                <Panel.Body>
                  <p>{step.requirements.reason}</p>
                  <RequirementsForm step={step} />
                </Panel.Body>
              )}
            </Panel>
          )}
          <h3 className="d-ib mr-10 mb-10">
            <FormattedMessage
              id={step.votesRanking ? 'modal-ranking' : 'proposal.vote.modal.title'}
            />
          </h3>
          <h4 className="excerpt d-ib mt-15">
            <FormattedMessage
              id={keyTradForModalVote}
              values={{
                num: step.viewerVotes ? step.viewerVotes.totalCount : 0,
              }}
            />
          </h4>
          <ProposalsUserVotesTable
            onSubmit={this.onSubmit}
            step={step}
            votes={step.viewerVotes}
            disabledKeyboard={this.disabledKeyboard}
            activeKeyboard={this.activeKeyboard}
          />
          {step.votesHelpText && (
            <div className="well mb-0 mt-15">
              <p>
                <b>
                  <FormattedMessage id="admin.fields.step.votesHelpText" />
                </b>
              </p>
              <WYSIWYGRender value={step.votesHelpText} />
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
    ) : null;
  }
}

const mapStateToProps = (state: GlobalState, props: ParentProps) => ({
  showModal: !!(
    state.proposal.currentVoteModal && state.proposal.currentVoteModal === props.proposal.id
  ),
  isSubmitting: !!state.proposal.isVoting,
  pristine: isPristine(getFormName(props.step))(state),
  invalid: isInvalid(formName)(state),
  viewerIsConfirmedByEmail: state.user.user && state.user.user.isEmailConfirmed,
  isAuthenticated: !!state.user.user,
});

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
    fragment ProposalVoteModal_step on ProposalStep
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      votesRanking
      votesHelpText
      ... on RequirementStep {
        requirements {
          viewerMeetsTheRequirements @include(if: $isAuthenticated)
          reason
          totalCount
        }
      }
      form {
        isProposalForm
      }
      ...RequirementsForm_step @arguments(isAuthenticated: $isAuthenticated)

      ...ProposalsUserVotesTable_step
      viewerVotes(orderBy: { field: POSITION, direction: ASC }) @include(if: $isAuthenticated) {
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
