// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCallback, useState } from 'react';
import moment from 'moment';
import { graphql, createFragmentContainer, commitLocalUpdate } from 'react-relay';
import { ConnectionHandler, fetchQuery_DEPRECATED } from 'relay-runtime';
import { Modal, Panel, Label } from 'react-bootstrap';
import { submit, isPristine, isInvalid, getFormSyncErrors } from 'redux-form';
import { connect } from 'react-redux';
import styled, { type StyledComponent } from 'styled-components';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { closeVoteModal, vote } from '~/redux/modules/proposal';
import ProposalsUserVotesTable, { getFormName } from '../../Project/Votes/ProposalsUserVotesTable';
import environment from '~/createRelayEnvironment';
import type { GlobalState, Dispatch } from '~/types';
import RequirementsForm, { formName, refetchViewer } from '../../Requirements/RequirementsForm';
import UpdateProposalVotesMutation from '~/mutations/UpdateProposalVotesMutation';
import type { ProposalVoteModal_proposal } from '~relay/ProposalVoteModal_proposal.graphql';
import type { ProposalVoteModal_step } from '~relay/ProposalVoteModal_step.graphql';
import WYSIWYGRender from '../../Form/WYSIWYGRender';
import invariant from '~/utils/invariant';
import { isInterpellationContextFromStep } from '~/utils/interpellationLabelHelper';
import VoteMinAlert from '~/components/Project/Votes/VoteMinAlert';
import usePrevious from '~/utils/hooks/usePrevious';

type ParentProps = {
  proposal: ProposalVoteModal_proposal,
  step: ProposalVoteModal_step,
};

type Props = {
  ...ParentProps,
  dispatch: Dispatch,
  showModal: boolean,
  isSubmitting: boolean,
  invalid: boolean,
  pristine: boolean,
  viewerIsConfirmedByEmail: boolean,
  isAuthenticated: boolean,
};

const ProposalVoteModalContainer: StyledComponent<{}, {}, typeof Modal> = styled(Modal).attrs({
  className: 'proposalVote__modal',
})`
  && .custom-modal-dialog {
    transform: none;
  }

  #confirm-proposal-vote {
    background: #0488cc !important;
    border-color: #0488cc !important;
  }
`;

export const ProposalVoteModal = ({
  dispatch,
  showModal,
  proposal,
  step,
  invalid,
  isSubmitting,
  isAuthenticated,
  pristine,
  viewerIsConfirmedByEmail,
}: Props) => {
  const [keyboard, setKeyboard] = useState(true);
  const prevShowModal = usePrevious(showModal);
  const intl = useIntl();
  const createTmpVote = useCallback(() => {
    commitLocalUpdate(environment, store => {
      const dataID = `client:newTmpVote:${proposal.id}`;

      let newNode = store.get(dataID);
      if (!newNode) {
        newNode = store.create(dataID, 'ProposalVote');
      }
      newNode.setValue(viewerIsConfirmedByEmail, 'published');
      if (!viewerIsConfirmedByEmail) {
        newNode.setValue('WAITING_AUTHOR_CONFIRMATION', 'notPublishedReason');
      }
      newNode.setValue(false, 'anonymous');
      newNode.setValue(null, 'id'); // This will be used to know that this is the tmp vote

      // $FlowFixMe Cannot call newNode.setLinkedRecord with store.get(...) bound to record
      newNode.setLinkedRecord(store.get(proposal.id), 'proposal');

      // Create a new edge
      const edgeID = `client:newTmpEdge:${proposal.id}`;
      let newEdge = store.get(edgeID);
      if (!newEdge) {
        newEdge = store.create(edgeID, 'ProposalVoteEdge');
      }
      newEdge.setLinkedRecord(newNode, 'node');

      const stepProxy = store.get(step.id);
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
  }, [proposal.id, step.id, viewerIsConfirmedByEmail]);

  const deleteTmpVote = useCallback(() => {
    commitLocalUpdate(environment, store => {
      const dataID = `client:newTmpVote:${proposal.id}`;
      const stepProxy = store.get(step.id);
      if (!stepProxy) return;
      const connection = stepProxy.getLinkedRecord('viewerVotes', {
        orderBy: { field: 'POSITION', direction: 'ASC' },
      });
      if (connection) {
        ConnectionHandler.deleteNode(connection, dataID);
        const totalCount = parseInt(connection.getValue('totalCount'), 10);
        connection.setValue(totalCount - 1, 'totalCount');
      }
      store.delete(dataID);
    });
  }, [proposal.id, step.id]);

  React.useEffect(() => {
    if (!prevShowModal && showModal) {
      createTmpVote();
    } else if (!showModal && prevShowModal) {
      deleteTmpVote();
    }
  }, [prevShowModal, showModal, deleteTmpVote, createTmpVote]);

  const onSubmit = (values: { votes: Array<{ public: boolean, id: string }> }) => {
    const tmpVote = values.votes.filter(v => v.id === null)[0];

    // First we add the vote
    return vote(dispatch, step.id, proposal.id, !tmpVote.public).then(data => {
      if (
        !data ||
        !data.addProposalVote ||
        !data.addProposalVote.voteEdge ||
        !data.addProposalVote.voteEdge.node ||
        typeof data.addProposalVote.voteEdge === 'undefined' ||
        data.addProposalVote.voteEdge === null
      ) {
        invariant(false, 'The vote id is missing.');
      }
      tmpVote.id = data.addProposalVote.voteEdge.node.id;

      // If the user didn't reorder
      // or update any vote privacy
      // we are clean
      if (!step.votesRanking && pristine) {
        return true;
      }

      // Otherwise we update/reorder votes
      return UpdateProposalVotesMutation.commit(
        {
          input: {
            step: step.id,
            votes: values.votes
              .filter(voteFilter => voteFilter.id !== null)
              .map(v => ({ id: v.id, anonymous: !v.public })),
          },
          stepId: step.id,
          isAuthenticated,
        },
        { id: null, position: -1, isVoteRanking: step.votesRanking },
      );
    });
  };

  const onHide = () => {
    dispatch(closeVoteModal());
  };

  const disabledKeyboard = () => {
    setKeyboard(false);
  };

  const activeKeyboard = () => {
    setKeyboard(true);
  };

  const getModalVoteTranslation = () => {
    if (step.form && step.form.objectType === 'PROPOSAL') {
      if (isInterpellationContextFromStep(step)) {
        return 'interpellation.support.count';
      }
      return 'votes-count';
    }
    return 'count-questions';
  };

  const getModalVoteTitleTranslation = () => {
    const isInterpellation = isInterpellationContextFromStep(step);
    if (step.votesRanking) {
      if (isInterpellation) {
        return 'project.supports.title';
      }

      return 'project.votes.title';
    }
    if (isInterpellation) {
      return 'global.support.for';
    }

    return 'global.vote.for';
  };

  const keyTradForModalVote = getModalVoteTranslation();
  const keyTradForModalVoteTitle = getModalVoteTitleTranslation();
  let votesHelpText =
    step.isSecretBallot && !step.publishedVoteDate && !step.canDisplayBallot
      ? intl.formatMessage({ id: 'publish-ballot-no-date-help-text' })
      : '';
  votesHelpText =
    step.isSecretBallot && step.publishedVoteDate && !step.canDisplayBallot
      ? intl.formatMessage(
          { id: 'publish-ballot-date-help-text' },
          {
            date: moment(step.publishedVoteDate).format('DD/MM/YYYY'),
            time: moment(step.publishedVoteDate).format('HH:mm'),
          },
        )
      : votesHelpText;
  if (step.votesHelpText) {
    votesHelpText = votesHelpText
      ? `${votesHelpText} ${step.votesHelpText}`
      : `${step.votesHelpText}`;
  }

  return step.requirements ? (
    <ProposalVoteModalContainer
      animation={false}
      enforceFocus={false}
      keyboard={keyboard}
      show={showModal}
      onHide={onHide}
      bsSize="large"
      role="dialog"
      aria-labelledby="contained-modal-title-lg">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-lg">
          {intl.formatMessage({ id: keyTradForModalVoteTitle })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {step.requirements && step.requirements.totalCount > 0 && (
          <Panel id="required-conditions" bsStyle="primary">
            <Panel.Heading>
              {intl.formatMessage({ id: 'requirements' })}{' '}
              {step.requirements?.viewerMeetsTheRequirements && (
                <Label bsStyle="primary">{intl.formatMessage({ id: 'filled' })}</Label>
              )}
            </Panel.Heading>
            {!step.requirements?.viewerMeetsTheRequirements && step.requirements?.reason && (
              <Panel.Body>
                <WYSIWYGRender value={step.requirements.reason} />
                <RequirementsForm step={step} />
              </Panel.Body>
            )}
          </Panel>
        )}
        <VoteMinAlert step={step} translationKey={keyTradForModalVote} />
        <ProposalsUserVotesTable
          onSubmit={onSubmit}
          step={step}
          votes={step.viewerVotes}
          disabledKeyboard={disabledKeyboard}
          activeKeyboard={activeKeyboard}
        />
        {votesHelpText && (
          <div className="well mb-0 mt-15">
            <p>
              <b>
                <FormattedMessage
                  id={
                    isInterpellationContextFromStep(step)
                      ? 'admin.fields.step.supportsHelpText'
                      : 'admin.fields.step.votesHelpText'
                  }
                />
              </b>
            </p>
            <WYSIWYGRender value={votesHelpText} />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <CloseButton className="pull-right" onClose={onHide} />
        <SubmitButton
          id="confirm-proposal-vote"
          disabled={step.requirements && step.requirements?.totalCount > 0 ? invalid : false}
          onSubmit={() => {
            dispatch(submit(`proposal-user-vote-form-step-${step.id}`));
            fetchQuery_DEPRECATED(environment, refetchViewer, {
              stepId: step.id,
              isAuthenticated,
            });
          }}
          label="global.save"
          isSubmitting={isSubmitting}
          bsStyle={!proposal.viewerHasVote || isSubmitting ? 'success' : 'danger'}
          style={{ marginLeft: '10px' }}
        />
      </Modal.Footer>
    </ProposalVoteModalContainer>
  ) : null;
};

const mapStateToProps = (state: GlobalState, props: ParentProps) => ({
  showModal: !!(
    state.proposal.currentVoteModal && state.proposal.currentVoteModal === props.proposal.id
  ),
  isSubmitting: !!state.proposal.isVoting,
  pristine: isPristine(getFormName(props.step))(state),
  invalid: isInvalid(formName)(state) || Object.keys(getFormSyncErrors(formName)(state)).length > 0,
  viewerIsConfirmedByEmail: state.user.user && state.user.user.isEmailConfirmed,
  isAuthenticated: !!state.user.user,
});

const container = connect<any, any, _, _, _, _>(mapStateToProps)(ProposalVoteModal);

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalVoteModal_proposal on Proposal @argumentDefinitions(stepId: { type: "ID!" }) {
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
      ...VoteMinAlert_step
      ... on RequirementStep {
        requirements {
          viewerMeetsTheRequirements @include(if: $isAuthenticated)
          reason
          totalCount
        }
      }
      isSecretBallot
      canDisplayBallot
      publishedVoteDate
      ...interpellationLabelHelper_step @relay(mask: false)
      ...RequirementsForm_step @arguments(isAuthenticated: $isAuthenticated)
      ...ProposalsUserVotesTable_step
      viewerVotes(orderBy: { field: POSITION, direction: ASC }) @include(if: $isAuthenticated) {
        ...ProposalsUserVotesTable_votes
        totalCount
        edges {
          node {
            id
            anonymous
          }
        }
      }
    }
  `,
});
