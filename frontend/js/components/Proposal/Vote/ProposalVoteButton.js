// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { openVoteModal } from '../../../redux/modules/proposal';
import UnpublishedTooltip from '../../Publishable/UnpublishedTooltip';
import type { Uuid, Dispatch, GlobalState } from '../../../types';
import type { ProposalVoteButton_proposal } from '~relay/ProposalVoteButton_proposal.graphql';
import FluxDispatcher from '../../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../../constants/AlertConstants';
import RemoveProposalVoteMutation from '../../../mutations/RemoveProposalVoteMutation';
import {
  isInterpellationContextFromStep,
  isInterpellationContextFromProposal,
} from '~/utils/interpellationLabelHelper';
import UpdateProposalVotesMutation from '~/mutations/UpdateProposalVotesMutation';

type Step = {|
  +id: Uuid,
  +votesRanking: boolean,
  +viewerVotes?: {|
    +edges: ?$ReadOnlyArray<?{|
      +node: {|
        +id: string,
        +anonymous: boolean,
      |},
    |}>,
  |},
|};

type ParentProps = {|
  proposal: ProposalVoteButton_proposal,
  currentStep: Step,
  user: { +id: string },
  isHovering: boolean,
  id: string,
|};

type Props = {|
  ...ParentProps,
  proposal: ProposalVoteButton_proposal,
  dispatch: Dispatch,
  isDeleting: boolean,
  disabled: boolean,
  isAuthenticated: boolean,
|};

const deleteVote = (
  currentStep: Step,
  proposal: ProposalVoteButton_proposal,
  isAuthenticated: boolean,
) => {
  return RemoveProposalVoteMutation.commit({
    stepId: currentStep.id,
    input: { proposalId: proposal.id, stepId: currentStep.id },
    isAuthenticated,
  })
    .then(response => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          bsStyle: 'success',
          content:
            response.removeProposalVote &&
            response.removeProposalVote.step &&
            isInterpellationContextFromStep(response.removeProposalVote.step)
              ? 'support.delete_success'
              : 'vote.delete_success',
        },
      });
    })
    .catch(e => {
      console.log(e); // eslint-disable-line no-console
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          bsStyle: 'warning',
          content: 'global.failure',
        },
      });
    });
};

const onDelete = (
  currentStep: Step,
  proposal: ProposalVoteButton_proposal,
  isAuthenticated: boolean,
) => {
  return deleteVote(currentStep, proposal, isAuthenticated).then(() => {
    const votes = currentStep?.viewerVotes?.edges
      ?.filter(Boolean)
      .filter(edge => edge.node.id !== proposal.viewerVote?.id)
      .map(edge => ({
        id: edge.node.id,
        anonymous: edge.node.anonymous,
      }));

    // Otherwise we update/reorder votes
    return UpdateProposalVotesMutation.commit(
      {
        input: {
          step: currentStep.id,
          votes: votes || [],
        },
        stepId: currentStep.id,
        isAuthenticated,
      },
      {
        id: proposal.id,
        position: Number.isNaN(parseInt(proposal.viewerVote?.ranking, 10))
          ? -1
          : parseInt(proposal.viewerVote?.ranking, 10),
        isVoteRanking: currentStep.votesRanking,
      },
    );
  });
};

// Should only be used via ProposalVoteButtonWrapper
export class ProposalVoteButton extends React.Component<Props> {
  static defaultProps = { disabled: false, isHovering: false };

  target: null | Button;

  getButtonStyle = () => {
    const { isHovering, proposal } = this.props;
    if (proposal.viewerVote && isHovering) {
      return 'btn btn-danger';
    }
    return 'btn btn-success';
  };

  getButtonText = () => {
    const { isHovering, proposal } = this.props;
    const isInterpellation = isInterpellationContextFromProposal(proposal);

    if (proposal.viewerHasVote) {
      if (isInterpellation) {
        return isHovering ? 'global.cancel' : 'interpellation.support.supported';
      }
      return isHovering ? 'global.cancel' : 'global.voted';
    }

    if (isInterpellation) {
      return 'global.support.for';
    }

    return 'global.vote.for';
  };

  render() {
    const {
      dispatch,
      currentStep,
      user,
      proposal,
      disabled,
      isDeleting,
      id,
      isAuthenticated,
    } = this.props;
    const classes = classNames({ disabled });
    const action = !user
      ? null
      : proposal.viewerHasVote
      ? () => {
          onDelete(currentStep, proposal, isAuthenticated);
        }
      : () => {
          dispatch(openVoteModal(proposal.id));
        };

    return (
      <Button
        id={id}
        ref={button => {
          this.target = button;
        }}
        className={`mr-10 proposal__button__vote ${this.getButtonStyle()} ${classes} `}
        onClick={disabled ? null : action}
        active={proposal.viewerHasVote}
        disabled={disabled || isDeleting}>
        {proposal.viewerVote && (
          <UnpublishedTooltip
            target={() => ReactDOM.findDOMNode(this.target)}
            publishable={proposal.viewerVote}
          />
        )}
        <i className="cap cap-hand-like-2 mr-5" />
        <FormattedMessage id={this.getButtonText()} />
      </Button>
    );
  }
}

const mapStateToProps = (state: GlobalState, props: ParentProps) => ({
  isDeleting: state.proposal.currentDeletingVote === props.proposal.id,
  isAuthenticated: !!state.user.user,
});

const container = connect(mapStateToProps)(ProposalVoteButton);

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalVoteButton_proposal on Proposal
      @argumentDefinitions(
        isAuthenticated: { type: "Boolean", defaultValue: true }
        stepId: { type: "ID!" }
      ) {
      id
      ...interpellationLabelHelper_proposal @relay(mask: false)
      viewerHasVote(step: $stepId) @include(if: $isAuthenticated)
      viewerVote(step: $stepId) @include(if: $isAuthenticated) {
        id
        ranking
        ...UnpublishedTooltip_publishable
      }
    }
  `,
});
